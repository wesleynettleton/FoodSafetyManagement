import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TakeRecordsPage = ({ navigation }) => {
  const recordTypes = [
    {
      title: 'Food Temperature',
      description: 'Record hot food temperatures',
      icon: 'thermostat',
      color: '#ff6b6b',
      onPress: () => navigation.navigate('FoodTemperature')
    },
    {
      title: 'Equipment Temperature',
      description: 'Log fridge & freezer temperatures',
      icon: 'ac-unit',
      color: '#96ceb4',
      onPress: () => navigation.navigate('EquipmentTemperature')
    },
    {
      title: 'Probe Calibration',
      description: 'Calibrate temperature probes',
      icon: 'build',
      color: '#4ecdc4',
      onPress: () => navigation.navigate('ProbeCalibration')
    },
    {
      title: 'Delivery Records',
      description: 'Log delivery inspections',
      icon: 'local-shipping',
      color: '#45b7d1',
      onPress: () => navigation.navigate('Delivery')
    },
    {
      title: 'Cooling Temperature',
      description: 'Track food cooling process',
      icon: 'opacity',
      color: '#feca57',
      onPress: () => navigation.navigate('CoolingTemperature')
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1976d2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Take Records</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Select the type of record you want to create</Text>
        
        <View style={styles.recordGrid}>
          {recordTypes.map((record, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recordCard}
              onPress={record.onPress}
            >
              <View style={[styles.iconContainer, { backgroundColor: record.color }]}>
                <Icon name={record.icon} size={32} color="white" />
              </View>
              <View style={styles.recordInfo}>
                <Text style={styles.recordTitle}>{record.title}</Text>
                <Text style={styles.recordDescription}>{record.description}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
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
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  recordGrid: {
    gap: 16,
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  recordDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default TakeRecordsPage; 