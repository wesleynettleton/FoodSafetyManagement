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

  const CircularIcon = ({ item }) => (
    <View style={styles.iconWrapper}>
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Icon 
          name={item.icon} 
          size={48} 
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
        <Text style={styles.headerTitle}>Food Safety Dashboard</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Icon name="account-circle" size={32} color="#1976d2" />
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
              activeOpacity={0.8}
            >
              <CircularIcon item={item} />
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
      height: 0.5,
    },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 92,
    height: 92,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconStyle: {
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  menuItemTitle: {
    fontSize: 22,
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