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

const DashboardScreen = ({ navigation }) => {
  const menuItems = [
    {
      title: 'Checklists',
      subtitle: 'Daily/Weekly safety checks',
      icon: 'checklist',
      color: '#4caf50',
      onPress: () => navigation.navigate('Checklists')
    },
    {
      title: 'Take Records',
      subtitle: 'Log food safety data',
      icon: 'edit',
      color: '#1976d2',
      onPress: () => navigation.navigate('TakeRecords')
    },
    {
      title: 'View Records',
      subtitle: 'Browse all records',
      icon: 'list',
      color: '#ff9ff3',
      onPress: () => navigation.navigate('Records')
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Food Safety Dashboard</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Icon 
            name="account-circle" 
            size={30} 
            color="#1976d2"
            allowFontScaling={false}
            style={styles.iconStyle}
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Icon 
                  name={item.icon} 
                  size={36} 
                  color="white"
                  allowFontScaling={false}
                  style={styles.iconStyle}
                />
              </View>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  menuGrid: {
    flexDirection: 'column',
    gap: 20,
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  iconStyle: {
    textAlignVertical: 'center',
    textAlign: 'center',
    includeFontPadding: false,
  },
  menuItemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  menuItemSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default DashboardScreen; 