import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { recordsAPI } from '../services/api';

const CoolingTemperatureScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    foodName: '',
    coolingStartTime: '',
    movedToStorageTime: '',
    temperatureAfter90Min: '',
    temperatureAfter2Hours: '',
    correctiveActions: ''
  });
  const [loading, setLoading] = useState(false);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM format
  };

  const handleSubmit = async () => {
    if (!formData.foodName || !formData.coolingStartTime || !formData.temperatureAfter90Min || !formData.temperatureAfter2Hours) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const temp90 = parseFloat(formData.temperatureAfter90Min);
    const temp2h = parseFloat(formData.temperatureAfter2Hours);

    if (isNaN(temp90) || isNaN(temp2h)) {
      Alert.alert('Error', 'Please enter valid temperatures');
      return;
    }

    // Convert time strings to ISO8601 datetime strings
    const convertTimeToDate = (timeString) => {
      if (!timeString) return new Date().toISOString();
      const today = new Date();
      const [hours, minutes] = timeString.split(':');
      today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return today.toISOString();
    };

    setLoading(true);
    try {
      await recordsAPI.createCoolingTemperature({
        foodName: formData.foodName,
        coolingStartTime: convertTimeToDate(formData.coolingStartTime),
        movedToStorageTime: convertTimeToDate(formData.movedToStorageTime),
        temperatureAfter90Min: temp90,
        temperatureAfter2Hours: temp2h,
        correctiveActions: formData.correctiveActions
      });
      
      Alert.alert('Success', 'Cooling temperature record added successfully', [
        {
          text: 'Add Another',
          onPress: () => {
            setFormData({
              foodName: '',
              coolingStartTime: '',
              movedToStorageTime: '',
              temperatureAfter90Min: '',
              temperatureAfter2Hours: '',
              correctiveActions: ''
            });
          }
        },
        {
          text: 'Go Back',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      console.error('Error adding record:', error);
      Alert.alert('Error', 'Failed to add record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCoolingStatus = () => {
    const temp90 = parseFloat(formData.temperatureAfter90Min);
    const temp2h = parseFloat(formData.temperatureAfter2Hours);
    
    if (isNaN(temp90) || isNaN(temp2h)) return null;
    
    if (temp90 <= 21 && temp2h <= 5) {
      return { status: 'SAFE COOLING', color: '#27ae60' };
    } else if (temp90 <= 25 && temp2h <= 8) {
      return { status: 'BORDERLINE', color: '#f39c12' };
    } else {
      return { status: 'UNSAFE COOLING', color: '#e74c3c' };
    }
  };

  const coolingStatus = getCoolingStatus();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1976d2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cooling Temperature</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Record Food Cooling Process</Text>
          <Text style={styles.formSubtitle}>Monitor food cooling to ensure safe temperature reduction</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Food Item *</Text>
            <TextInput
              style={styles.input}
              value={formData.foodName}
              onChangeText={(text) => setFormData({...formData, foodName: text})}
              placeholder="e.g., Chicken Soup, Beef Stew, Rice"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cooling Start Time *</Text>
            <View style={styles.timeInputContainer}>
              <TextInput
                style={styles.input}
                value={formData.coolingStartTime}
                onChangeText={(text) => setFormData({...formData, coolingStartTime: text})}
                placeholder="HH:MM (e.g., 14:30)"
                placeholderTextColor="#999"
              />
              <TouchableOpacity 
                style={styles.nowButton}
                onPress={() => setFormData({...formData, coolingStartTime: getCurrentTime()})}
              >
                <Text style={styles.nowButtonText}>Now</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Moved to Storage Time</Text>
            <View style={styles.timeInputContainer}>
              <TextInput
                style={styles.input}
                value={formData.movedToStorageTime}
                onChangeText={(text) => setFormData({...formData, movedToStorageTime: text})}
                placeholder="HH:MM (e.g., 16:30)"
                placeholderTextColor="#999"
              />
              <TouchableOpacity 
                style={styles.nowButton}
                onPress={() => setFormData({...formData, movedToStorageTime: getCurrentTime()})}
              >
                <Text style={styles.nowButtonText}>Now</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Temperature After 90 Minutes (°C) *</Text>
            <TextInput
              style={styles.input}
              value={formData.temperatureAfter90Min}
              onChangeText={(text) => setFormData({...formData, temperatureAfter90Min: text})}
              placeholder="e.g., 18"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Temperature After 2 Hours (°C) *</Text>
            <TextInput
              style={styles.input}
              value={formData.temperatureAfter2Hours}
              onChangeText={(text) => setFormData({...formData, temperatureAfter2Hours: text})}
              placeholder="e.g., 4"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          {coolingStatus && (
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: coolingStatus.color }]}>
                <Icon name="thermostat" size={16} color="white" />
                <Text style={styles.statusText}>{coolingStatus.status}</Text>
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Corrective Actions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.correctiveActions}
              onChangeText={(text) => setFormData({...formData, correctiveActions: text})}
              placeholder="Any actions taken if cooling was inadequate"
              placeholderTextColor="#999"
              multiline
              numberOfLines={2}
            />
          </View>

          <Text style={styles.guidelineText}>
            Food should be &lt;8°C within 2 hours
          </Text>

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Icon name="save" size={20} color="white" style={styles.submitButtonIcon} />
            <Text style={styles.submitButtonText}>
              {loading ? 'Saving...' : 'Save Cooling Record'}
            </Text>
          </TouchableOpacity>
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
    backgroundColor: '#fafafa',
    flex: 1,
    color: '#000',
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nowButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nowButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#1976d2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
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
    fontSize: 16,
    fontWeight: '600',
  },
  guidelineText: {
    color: '#666',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default CoolingTemperatureScreen; 