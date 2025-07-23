import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { equipmentAPI, recordsAPI } from '../services/api';

const EquipmentTemperatureScreen = ({ navigation }) => {
  const [equipment, setEquipment] = useState([]);
  const [temperatureInputs, setTemperatureInputs] = useState({});
  const [notesInputs, setNotesInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await equipmentAPI.getAll();
      const data = response.data;
      setEquipment(data);
      
      // Initialize temperature and notes inputs for each equipment
      const initialTemps = {};
      const initialNotes = {};
      data.forEach(eq => {
        initialTemps[eq._id] = '';
        initialNotes[eq._id] = '';
      });
      setTemperatureInputs(initialTemps);
      setNotesInputs(initialNotes);
    } catch (err) {
      setError('Failed to fetch equipment. Please check your connection.');
      console.error('Equipment fetch error:', err);
    } finally {
      setLoadingEquipment(false);
    }
  };

  const handleTemperatureChange = (equipmentId, value) => {
    setTemperatureInputs(prev => ({
      ...prev,
      [equipmentId]: value
    }));
  };

  const handleNotesChange = (equipmentId, value) => {
    setNotesInputs(prev => ({
      ...prev,
      [equipmentId]: value
    }));
  };

  const getTemperatureStatus = (temperature, equipmentType) => {
    const temp = parseFloat(temperature);
    if (isNaN(temp)) return null;

    if (equipmentType === 'freezer') {
      if (temp <= -18) return { status: 'SAFE', color: '#27ae60', icon: 'check-circle' };
      if (temp >= -17 && temp <= -15.1) return { status: 'WARNING', color: '#f39c12', icon: 'warning' };
      return { status: 'DANGER', color: '#e74c3c', icon: 'error' };
    } else if (equipmentType === 'fridge') {
      if (temp >= 0 && temp <= 4) return { status: 'SAFE', color: '#27ae60', icon: 'check-circle' };
      if ((temp >= 4.1 && temp <= 5) || temp < 0) return { status: 'WARNING', color: '#f39c12', icon: 'warning' };
      return { status: 'DANGER', color: '#e74c3c', icon: 'error' };
    }
    return null;
  };

  const getEquipmentIcon = (type) => {
    return type === 'freezer' ? 'ac-unit' : 'kitchen';
  };

  const getEquipmentColor = (type) => {
    return type === 'freezer' ? '#64b5f6' : '#81c784';
  };

  const hasValidTemperatures = () => {
    return Object.values(temperatureInputs).some(temp => 
      temp.trim() !== '' && !isNaN(parseFloat(temp))
    );
  };

  const handleSubmit = async () => {
    if (!hasValidTemperatures()) {
      Alert.alert('No Data', 'Please enter at least one temperature before submitting.');
      return;
    }

    setLoading(true);
    setError('');

    // Collect all valid submissions
    const submissions = [];
    for (const equipmentId in temperatureInputs) {
      const tempValue = temperatureInputs[equipmentId];
      const noteValue = notesInputs[equipmentId] || '';

      if (tempValue.trim() !== '' && !isNaN(parseFloat(tempValue))) {
        const equipmentDetails = equipment.find(eq => eq._id === equipmentId);
        if (equipmentDetails) {
          submissions.push({
            equipment: equipmentId, // Changed from equipmentId to equipment
            temperature: parseFloat(tempValue),
            equipmentType: equipmentDetails.type,
            note: noteValue,
            equipmentName: equipmentDetails.name
          });
        }
      }
    }

    try {
      const promises = submissions.map(async (sub) => {
        await recordsAPI.createTemperature({
          equipment: sub.equipment,
          temperature: sub.temperature,
          equipmentType: sub.equipmentType,
          note: sub.note
        });
        return { success: true, name: sub.equipmentName };
      });

      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected');

      if (successful > 0) {
        Alert.alert('Success!', `${successful} temperature record(s) saved successfully!`, [
          {
            text: 'Record More',
            onPress: () => {
              // Reset inputs
              const resetTemps = {};
              const resetNotes = {};
              equipment.forEach(eq => {
                resetTemps[eq._id] = '';
                resetNotes[eq._id] = '';
              });
              setTemperatureInputs(resetTemps);
              setNotesInputs(resetNotes);
            }
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
            style: 'default'
          }
        ]);
      }

      if (failed.length > 0) {
        setError(`Failed to save ${failed.length} record(s). Please try again.`);
      }

    } catch (err) {
      setError('Failed to save temperature records. Please try again.');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingEquipment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#1976d2" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Equipment Temperatures</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.loadingText}>Loading equipment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1976d2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Equipment Temperatures</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={styles.errorContainer}>
            <Icon name="error" size={20} color="#e74c3c" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.infoCard}>
          <Icon name="info" size={20} color="#1976d2" />
          <Text style={styles.infoText}>
            Record temperatures for all equipment at your location. Only enter temperatures for equipment you're checking today.
          </Text>
        </View>

        {equipment.length === 0 ? (
          <View style={styles.noEquipmentCard}>
            <Icon name="devices-other" size={48} color="#ccc" />
            <Text style={styles.noEquipmentTitle}>No Equipment Found</Text>
            <Text style={styles.noEquipmentText}>
              No equipment has been set up for your location yet. Contact your administrator to add equipment.
            </Text>
          </View>
        ) : (
          equipment.map((item, index) => {
            const tempStatus = getTemperatureStatus(temperatureInputs[item._id], item.type);
            
            return (
              <View key={item._id} style={styles.equipmentCard}>
                <View style={styles.equipmentHeader}>
                  <View style={styles.equipmentInfo}>
                    <View style={[styles.equipmentIcon, { backgroundColor: getEquipmentColor(item.type) }]}>
                      <Icon name={getEquipmentIcon(item.type)} size={24} color="white" />
                    </View>
                    <View style={styles.equipmentDetails}>
                      <Text style={styles.equipmentName}>{item.name}</Text>
                      <Text style={styles.equipmentType}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
                    </View>
                  </View>
                  {tempStatus && (
                    <View style={[styles.statusBadge, { backgroundColor: tempStatus.color }]}>
                      <Icon name={tempStatus.icon} size={16} color="white" />
                      <Text style={styles.statusText}>{tempStatus.status}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Temperature (°C)</Text>
                  <TextInput
                    style={[styles.temperatureInput, tempStatus && { borderColor: tempStatus.color, borderWidth: 2 }]}
                    value={temperatureInputs[item._id]}
                    onChangeText={(text) => handleTemperatureChange(item._id, text)}
                    placeholder={item.type === 'freezer' ? 'e.g., -18' : 'e.g., 3'}
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                  
                  <Text style={styles.inputLabel}>Notes (Optional)</Text>
                  <TextInput
                    style={styles.notesInput}
                    value={notesInputs[item._id]}
                    onChangeText={(text) => handleNotesChange(item._id, text)}
                    placeholder="Add any observations or notes..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={2}
                  />
                </View>
              </View>
            );
          })
        )}

        {equipment.length > 0 && (
          <View style={styles.submitSection}>
            <View style={styles.guidelinesCard}>
              <Text style={styles.guidelinesTitle}>Temperature Guidelines</Text>
              <View style={styles.guidelineItem}>
                <Icon name="ac-unit" size={16} color="#64b5f6" />
                <Text style={styles.guidelineText}>Freezers: ≤ -18°C</Text>
              </View>
              <View style={styles.guidelineItem}>
                <Icon name="kitchen" size={16} color="#81c784" />
                <Text style={styles.guidelineText}>Fridges: 0-4°C</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[
                styles.submitButton, 
                loading && styles.submitButtonDisabled,
                !hasValidTemperatures() && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={loading || !hasValidTemperatures()}
            >
              {loading ? (
                <ActivityIndicator size={20} color="white" style={styles.submitButtonIcon} />
              ) : (
                <Icon name="save" size={20} color="white" style={styles.submitButtonIcon} />
              )}
              <Text style={styles.submitButtonText}>
                {loading ? 'Saving...' : 'Submit All Records'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1565c0',
    lineHeight: 20,
  },
  noEquipmentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noEquipmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noEquipmentText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  equipmentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  equipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  equipmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  equipmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  equipmentDetails: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  equipmentType: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inputSection: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  temperatureInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 16,
    color: '#000',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    height: 80,
    textAlignVertical: 'top',
    color: '#000',
  },
  submitSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  guidelinesCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  guidelineText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#1976d2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EquipmentTemperatureScreen; 