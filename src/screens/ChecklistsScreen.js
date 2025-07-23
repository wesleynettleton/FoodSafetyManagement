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

const ChecklistsScreen = ({ navigation }) => {
  const checklistItems = [
    {
      title: 'Opening Checks',
      subtitle: 'Daily opening procedures',
      icon: 'wb-sunny',
      color: '#ff9800',
      onPress: () => navigation.navigate('OpeningChecks')
    },
    {
      title: 'Closing Checks',
      subtitle: 'Daily closing procedures',
      icon: 'nights-stay',
      color: '#3f51b5',
      onPress: () => navigation.navigate('ClosingChecks')
    },
    {
      title: 'Weekly Checks',
      subtitle: 'Weekly safety procedures',
      icon: 'date-range',
      color: '#9c27b0',
      onPress: () => navigation.navigate('WeeklyChecks')
    }
  ];

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
        <Text style={styles.headerTitle}>Checklists</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuGrid}>
          {checklistItems.map((item, index) => (
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

export default ChecklistsScreen; 