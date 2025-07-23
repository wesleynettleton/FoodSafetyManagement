import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Switch
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { recordsAPI } from '../services/api';

const ProbeCalibrationScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    probeId: '',
    iceWaterTemp: '',
    boilingWaterTemp: '',
    isCalibrated: true,
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.probeId || !formData.iceWaterTemp || !formData.boilingWaterTemp) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const iceTemp = parseFloat(formData.iceWaterTemp);
    const boilingTemp = parseFloat(formData.boilingWaterTemp);

    if (isNaN(iceTemp) || isNaN(boilingTemp)) {
      Alert.alert('Error', 'Please enter valid temperatures');
      return;
    }

    // Validate temperature ranges
    const isIceValid = iceTemp >= -1 && iceTemp <= 1;
    const isBoilingValid = boilingTemp >= 99 && boilingTemp <= 101;

    if (!isIceValid || !isBoilingValid) {
      const errors = [];
      if (!isIceValid) errors.push('Ice water temperature should be 0°C (±1°C)');
      if (!isBoilingValid) errors.push('Boiling water temperature should be 100°C (±1°C)');
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    setLoading(true);
    try {
      // Create two separate records - one for each calibration method
      await Promise.all([
        recordsAPI.createProbeCalibration({
          probeId: formData.probeId,
          temperature: iceTemp,
          calibrationMethod: 'ice',
          isCalibrated: formData.isCalibrated,
          notes: formData.notes
        }),
        recordsAPI.createProbeCalibration({
          probeId: formData.probeId,
          temperature: boilingTemp,
          calibrationMethod: 'boiling',
          isCalibrated: formData.isCalibrated,
          notes: formData.notes
        })
      ]);
      
      Alert.alert('Success', 'Probe calibration records added successfully', [
        {
          text: 'Add Another',
          onPress: () => {
            setFormData({
              probeId: '',
              iceWaterTemp: '',
              boilingWaterTemp: '',
              isCalibrated: true,
              notes: ''
            });
          }
        },
        {
          text: 'Go Back',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      console.error('Error adding records:', error);
      Alert.alert('Error', 'Failed to add records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getIceTemperatureStatus = () => {
    if (!formData.iceWaterTemp) return null;
    const temp = parseFloat(formData.iceWaterTemp);
    if (isNaN(temp)) return null;
    
    if (temp >= -1 && temp <= 1) {
      return { status: 'VALID', color: '#27ae60' };
    } else {
      return { status: 'OUT OF RANGE', color: '#e74c3c' };
    }
  };

  const getBoilingTemperatureStatus = () => {
    if (!formData.boilingWaterTemp) return null;
    const temp = parseFloat(formData.boilingWaterTemp);
    if (isNaN(temp)) return null;
    
    if (temp >= 99 && temp <= 101) {
      return { status: 'VALID', color: '#27ae60' };
    } else {
      return { status: 'OUT OF RANGE', color: '#e74c3c' };
    }
  };

  const iceStatus = getIceTemperatureStatus();
  const boilingStatus = getBoilingTemperatureStatus();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1976d2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Probe Calibration</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Calibrate Temperature Probe</Text>
          <Text style={styles.formSubtitle}>Record probe calibration using ice water and boiling water methods</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Probe ID *</Text>
            <TextInput
              style={styles.input}
              value={formData.probeId}
              onChangeText={(text) => setFormData({...formData, probeId: text})}
              placeholder="e.g., PROBE-001, Kitchen-Probe-A"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.sectionHeader}>
            <Icon name="ac-unit" size={20} color="#2196f3" />
            <Text style={styles.sectionTitle}>Ice Water Calibration (0°C)</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Temperature (°C) *</Text>
            <View style={styles.temperatureInputContainer}>
              <TextInput
                style={styles.input}
                value={formData.iceWaterTemp}
                onChangeText={(text) => setFormData({...formData, iceWaterTemp: text})}
                placeholder="e.g., 0.2"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              {iceStatus && (
                <View style={[styles.statusBadge, { backgroundColor: iceStatus.color }]}>
                  <Text style={styles.statusText}>{iceStatus.status}</Text>
                </View>
              )}
            </View>
            <Text style={styles.helperText}>Acceptable range: -1°C to 1°C</Text>
          </View>

          <View style={styles.sectionHeader}>
            <Icon name="whatshot" size={20} color="#f44336" />
            <Text style={styles.sectionTitle}>Boiling Water Calibration (100°C)</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Temperature (°C) *</Text>
            <View style={styles.temperatureInputContainer}>
              <TextInput
                style={styles.input}
                value={formData.boilingWaterTemp}
                onChangeText={(text) => setFormData({...formData, boilingWaterTemp: text})}
                placeholder="e.g., 100.1"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              {boilingStatus && (
                <View style={[styles.statusBadge, { backgroundColor: boilingStatus.color }]}>
                  <Text style={styles.statusText}>{boilingStatus.status}</Text>
                </View>
              )}
            </View>
            <Text style={styles.helperText}>Acceptable range: 99°C to 101°C</Text>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Probe is Calibrated</Text>
            <Switch
              value={formData.isCalibrated}
              onValueChange={(value) => setFormData({...formData, isCalibrated: value})}
              trackColor={{ false: '#767577', true: '#1976d2' }}
              thumbColor={formData.isCalibrated ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({...formData, notes: text})}
              placeholder="Add any additional notes about the calibration..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Icon name="save" size={20} color="white" style={styles.submitButtonIcon} />
            <Text style={styles.submitButtonText}>
              {loading ? 'Saving...' : 'Create Calibration Records'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.guidelinesCard}>
          <Text style={styles.guidelinesTitle}>Calibration Guidelines</Text>
          <View style={styles.guideline}>
            <View style={[styles.guidelineDot, { backgroundColor: '#2196f3' }]} />
            <Text style={styles.guidelineText}>
              <Text style={styles.guidelineBold}>Ice Water:</Text> 0°C (±1°C acceptable range)
            </Text>
          </View>
          <View style={styles.guideline}>
            <View style={[styles.guidelineDot, { backgroundColor: '#f44336' }]} />
            <Text style={styles.guidelineText}>
              <Text style={styles.guidelineBold}>Boiling Water:</Text> 100°C (±1°C acceptable range)
            </Text>
          </View>
          <View style={styles.guideline}>
            <View style={[styles.guidelineDot, { backgroundColor: '#27ae60' }]} />
            <Text style={styles.guidelineText}>
              <Text style={styles.guidelineBold}>Valid:</Text> Both readings within acceptable range
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  temperatureInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  guidelinesCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  guidelinesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  guideline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  guidelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  guidelineText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  guidelineBold: {
    fontWeight: 'bold',
  },
});

export default ProbeCalibrationScreen; 