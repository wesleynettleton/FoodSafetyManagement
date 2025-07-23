import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { recordsAPI } from '../services/api';

const RecordListScreen = ({ route, navigation }) => {
  const { recordType, title } = route.params;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await recordsAPI.getAll();
      let filteredRecords = response.data;
      
      // Filter records based on type
      if (recordType !== 'all') {
        if (recordType === 'equipment_temperature') {
          // Include both fridge_temperature and freezer_temperature
          filteredRecords = response.data.filter(record => 
            record.type === 'fridge_temperature' || record.type === 'freezer_temperature'
          );
        } else {
          filteredRecords = response.data.filter(record => record.type === recordType);
        }
      }
      
      // Sort by creation date (newest first)
      filteredRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setRecords(filteredRecords);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching records:', error);
      Alert.alert('Error', 'Failed to load records');
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecords().finally(() => setRefreshing(false));
  };

  const getRecordIcon = (type) => {
    switch (type) {
      case 'food_temperature':
        return 'restaurant';
      case 'fridge_temperature':
      case 'freezer_temperature':
        return 'ac-unit';
      case 'cooling_temperature':
        return 'thermostat';
      case 'delivery':
        return 'local-shipping';
      case 'probe_calibration':
        return 'settings';
      case 'weekly_record':
        return 'event-note';
      default:
        return 'list';
    }
  };

  const getRecordColor = (type) => {
    switch (type) {
      case 'food_temperature':
        return '#FF6B6B';
      case 'fridge_temperature':
        return '#45B7D1';
      case 'freezer_temperature':
        return '#4ECDC4';
      case 'cooling_temperature':
        return '#96CEB4';
      case 'delivery':
        return '#FFEAA7';
      case 'probe_calibration':
        return '#DDA0DD';
      case 'weekly_record':
        return '#F4A460';
      default:
        return '#74B9FF';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'No time';
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getRecordTitle = (record) => {
    switch (record.type) {
      case 'food_temperature':
        return record.foodName || 'Food Temperature';
      case 'fridge_temperature':
      case 'freezer_temperature':
        return record.equipment?.name || record.equipmentName || `${record.equipmentType || 'Equipment'} Temperature`;
      case 'cooling_temperature':
        return `Cooling: ${record.foodName || 'Unknown Food'}`;
      case 'delivery':
        return record.supplier || 'Delivery';
      case 'probe_calibration':
        return `Probe ${record.probeId || 'Unknown'}`;
      case 'weekly_record':
        return 'Weekly Record';
      default:
        return 'Record';
    }
  };

  const getRecordSubtitle = (record) => {
    switch (record.type) {
      case 'food_temperature':
        return `${record.temperature}°C`;
      case 'fridge_temperature':
      case 'freezer_temperature':
        return `${record.temperature}°C`;
      case 'cooling_temperature':
        return `90min: ${record.temperatureAfter90Min}°C | 2hr: ${record.temperatureAfter2Hours}°C`;
      case 'delivery':
        return `${record.temperature}°C`;
      case 'probe_calibration':
        return `${record.temperature}°C - ${record.isCalibrated ? 'Calibrated' : 'Not Calibrated'}`;
      case 'weekly_record':
        return `Week commencing ${formatDate(record.weekCommencing)}`;
      default:
        return 'No details';
    }
  };

  const getRecordDetails = (record) => {
    const details = [];
    
    // Add location if available
    if (record.location?.name) {
      details.push(`Location: ${record.location.name}`);
    }
    
    // Add specific details based on record type (removing redundant info)
    switch (record.type) {
      case 'food_temperature':
        // Don't show foodName or createdBy as they're already in title/subtitle
        if (record.notes) details.push(`Notes: ${record.notes}`);
        break;
      case 'fridge_temperature':
      case 'freezer_temperature':
        // Don't show equipment name as it's already in title
        if (record.note) details.push(`Note: ${record.note}`);
        break;
      case 'cooling_temperature':
        // Show all cooling-specific details
        if (record.coolingStartTime) {
          details.push(`Cooling Started: ${formatTime(record.coolingStartTime)}`);
        }
        if (record.movedToStorageTime) {
          details.push(`Moved to Storage: ${formatTime(record.movedToStorageTime)}`);
        }
        if (record.correctiveActions) {
          details.push(`Corrective Actions: ${record.correctiveActions}`);
        }
        break;
      case 'delivery':
        // Don't show supplier as it's already in title
        if (record.notes) details.push(`Notes: ${record.notes}`);
        break;
      case 'probe_calibration':
        // Don't show probeId as it's already in title
        if (record.deviation) details.push(`Deviation: ${record.deviation}°C`);
        break;
      case 'weekly_record':
        if (record.managerSignature) details.push(`Signed by: ${record.managerSignature}`);
        break;
    }
    
    return details;
  };

  const getTemperatureStatus = (record) => {
    if (record.temperature === null || record.temperature === undefined || record.temperature === '') return null;
    
    const temp = parseFloat(record.temperature);
    if (isNaN(temp)) return null;
    
    let status = '';
    let color = '#666';
    
    switch (record.type) {
      case 'food_temperature':
        // Food temperature logic: Hot food (63°C+) = SAFE, Cold food (≤5°C) = SAFE, 
        // Danger zone (5°C to 63°C) = DANGER
        if (temp <= 5) {
          // Cold food storage - safe
          status = 'SAFE';
          color = '#27ae60';
        } else if (temp >= 63) {
          // Hot food holding - safe
          status = 'SAFE';
          color = '#27ae60';
        } else if (temp >= 60) {
          // Getting close to safe hot holding temp
          status = 'WARNING';
          color = '#f39c12';
        } else {
          // Danger zone - bacteria can multiply rapidly
          status = 'DANGER';
          color = '#e74c3c';
        }
        break;
      case 'fridge_temperature':
        if (temp > 5) {
          status = 'DANGER';
          color = '#e74c3c';
        } else if (temp > 4) {
          status = 'WARNING';
          color = '#f39c12';
        } else if (temp >= 0) {
          status = 'SAFE';
          color = '#27ae60';
        } else {
          // Below 0°C is too cold for a fridge
          status = 'WARNING';
          color = '#f39c12';
        }
        break;
      case 'freezer_temperature':
        if (temp > -15) {
          status = 'DANGER';
          color = '#e74c3c';
        } else if (temp > -18) {
          status = 'WARNING';
          color = '#f39c12';
        } else {
          status = 'SAFE';
          color = '#27ae60';
        }
        break;
      case 'delivery':
        // Delivery temperatures: frozen goods should be ≤-15°C, chilled goods should be ≤5°C
        if (temp <= -15) {
          // Frozen delivery - safe
          status = 'SAFE';
          color = '#27ae60';
        } else if (temp <= -12) {
          // Frozen but getting a bit warm
          status = 'WARNING';
          color = '#f39c12';
        } else if (temp <= 5) {
          // Chilled delivery - safe
          status = 'SAFE';
          color = '#27ae60';
        } else if (temp <= 8) {
          // Chilled but getting warm
          status = 'WARNING';
          color = '#f39c12';
        } else {
          // Too warm for safe delivery
          status = 'DANGER';
          color = '#e74c3c';
        }
        break;
      case 'probe_calibration':
        // For probe calibration, show calibration status instead of temperature status
        if (record.isCalibrated === true) {
          status = 'CALIBRATED';
          color = '#27ae60';
        } else if (record.isCalibrated === false) {
          status = 'NOT CALIBRATED';
          color = '#e74c3c';
        } else {
          // If calibration status is unknown, don't show status badge
          return null;
        }
        break;
      case 'cooling_temperature':
      case 'weekly_record':
        // These record types don't need temperature status badges
        return null;
      default:
        // Unknown record type - don't show status badge
        return null;
    }
    
    return { status, color };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading records...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{records.length} records found</Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name={getRecordIcon(recordType)} size={64} color="#ccc" />
            <Text style={styles.emptyText}>No records found</Text>
            <Text style={styles.emptySubtext}>No {title.toLowerCase()} have been recorded yet</Text>
          </View>
        ) : (
          records.map((record, index) => {
            const tempStatus = getTemperatureStatus(record);
            const details = getRecordDetails(record);
            
            return (
              <TouchableOpacity 
                key={record._id || index} 
                style={[styles.recordCard, { borderLeftColor: getRecordColor(record.type) }]}
                onPress={() => {
                  Alert.alert('Record Details', JSON.stringify(record, null, 2));
                }}
              >
                <View style={styles.recordHeader}>
                  <View style={[styles.recordIconContainer, { backgroundColor: getRecordColor(record.type) + '20' }]}>
                    <Icon 
                      name={getRecordIcon(record.type)} 
                      size={24} 
                      color={getRecordColor(record.type)} 
                    />
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordTitle}>{getRecordTitle(record)}</Text>
                    <Text style={styles.recordSubtitle}>{getRecordSubtitle(record)}</Text>
                    {tempStatus && (
                      <View style={[styles.statusBadge, { backgroundColor: tempStatus.color }]}>
                        <Text style={styles.statusText}>{tempStatus.status}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.recordDate}>{formatDate(record.createdAt)}</Text>
                </View>
                
                {details.length > 0 && (
                  <View style={styles.recordDetails}>
                    {details.map((detail, idx) => (
                      <Text key={idx} style={styles.detailText}>{detail}</Text>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6C757D',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  recordCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  recordSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 12,
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  recordDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});

export default RecordListScreen; 