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

const TakeRecordsScreen = ({ navigation }) => {
  const recordTypes = [
    {
      title: 'Food Temperature',
      description: 'Record hot food temperatures',
      icon: 'thermostat',
      color: '#ff6b6b',
      onPress: () => navigation.navigate('FoodTemperature')
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
      title: 'Equipment Temperature',
      description: 'Record fridge & freezer temps',
      icon: 'ac-unit',
      color: '#96ceb4',
      onPress: () => navigation.navigate('EquipmentTemperature')
    },
    {
      title: 'Cooling Temperature',
      description: 'Log food cooling process',
      icon: 'opacity',
      color: '#feca57',
      onPress: () => navigation.navigate('CoolingTemperature')
    }
  ];

  const CircularIcon = ({ item }) => (
    <View style={styles.iconContainerOuter}>
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Icon 
          name={item.icon} 
          size={36} 
          color="white"
          allowFontScaling={false}
          style={styles.iconStyle}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon 
            name="arrow-back" 
            size={24} 
            color="#1976d2"
            allowFontScaling={false}
            style={styles.iconStyle}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Take Records</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Choose the type of record you want to create</Text>
        
        <View style={styles.recordGrid}>
          {recordTypes.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recordCard}
              onPress={item.onPress}
            >
              <CircularIcon item={item} />
              <View style={styles.textContainer}>
                <Text style={styles.recordTitle}>{item.title}</Text>
                <Text style={styles.recordDescription}>{item.description}</Text>
              </View>
              <Icon 
                name="chevron-right" 
                size={24} 
                color="#ccc"
                allowFontScaling={false}
                style={styles.iconStyle}
              />
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
  scrollContent: {
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
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
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 4,
  },
  iconContainerOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginRight: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  textContainer: {
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
  iconStyle: {
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});

export default TakeRecordsScreen; 