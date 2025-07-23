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

const DeliveryScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    supplier: '',
    temperature: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.supplier || !formData.temperature) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const temperature = parseFloat(formData.temperature);
    if (isNaN(temperature)) {
      Alert.alert('Error', 'Please enter a valid temperature');
      return;
    }

    setLoading(true);
    try {
      await recordsAPI.createDelivery({
        supplier: formData.supplier,
        temperature: temperature,
        notes: formData.notes
      });
      
      Alert.alert('Success', 'Delivery record added successfully', [
        {
          text: 'Add Another',
          onPress: () => {
            setFormData({
              supplier: '',
              temperature: '',
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
      console.error('Error adding record:', error);
      Alert.alert('Error', 'Failed to add record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTemperatureStatus = (temp) => {
    const temperature = parseFloat(temp);
    if (isNaN(temperature)) return null;
    
    if (temperature <= -15) {
      return { status: 'FROZEN SAFE', color: '#27ae60' };
    } else if (temperature <= -12) {
      return { status: 'FROZEN WARNING', color: '#f39c12' };
    } else if (temperature <= 5) {
      return { status: 'CHILLED SAFE', color: '#27ae60' };
    } else if (temperature <= 8) {
      return { status: 'CHILLED WARNING', color: '#f39c12' };
    } else {
      return { status: 'REJECT', color: '#e74c3c' };
    }
  };

  const tempStatus = getTemperatureStatus(formData.temperature);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1976d2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Record</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Record Delivery</Text>
          <Text style={styles.formSubtitle}>Record delivery temperature and supplier information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Supplier Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.supplier}
              onChangeText={(text) => setFormData({...formData, supplier: text})}
              placeholder="e.g., Fresh Foods Ltd, Local Farm Co"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Temperature (°C) *</Text>
            <View style={styles.temperatureInputContainer}>
              <TextInput
                style={styles.input}
                value={formData.temperature}
                onChangeText={(text) => setFormData({...formData, temperature: text})}
                placeholder="e.g., 2 (chilled) or -18 (frozen)"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              {tempStatus && (
                <View style={[styles.statusBadge, { backgroundColor: tempStatus.color }]}>
                  <Text style={styles.statusText}>{tempStatus.status}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({...formData, notes: text})}
              placeholder="Any observations, issues, or details about the delivery"
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
              {loading ? 'Saving...' : 'Save Delivery Record'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.guidelinesCard}>
          <Text style={styles.guidelinesTitle}>Delivery Temperature Guidelines</Text>
          <View style={styles.guideline}>
            <View style={[styles.guidelineDot, { backgroundColor: '#27ae60' }]} />
            <Text style={styles.guidelineText}>
              <Text style={styles.guidelineBold}>Safe:</Text> Frozen ≤-15°C, Chilled ≤5°C
            </Text>
          </View>
          <View style={styles.guideline}>
            <View style={[styles.guidelineDot, { backgroundColor: '#f39c12' }]} />
            <Text style={styles.guidelineText}>
              <Text style={styles.guidelineBold}>Warning:</Text> Frozen -14 to -12°C, Chilled 6-8°C
            </Text>
          </View>
          <View style={styles.guideline}>
            <View style={[styles.guidelineDot, { backgroundColor: '#e74c3c' }]} />
            <Text style={styles.guidelineText}>
              <Text style={styles.guidelineBold}>Reject:</Text> Temperature {'>'} 8°C
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
    color: '#000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  temperatureInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
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
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  guidelineText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  guidelineBold: {
    fontWeight: 'bold',
    color: '#333',
  },
});

export default DeliveryScreen; 