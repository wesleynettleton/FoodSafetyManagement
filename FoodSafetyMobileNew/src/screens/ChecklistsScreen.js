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

  const CircularIcon = ({ item }) => (
    <View style={styles.iconContainerOuter}>
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Icon 
          name={item.icon} 
          size={44} 
          color="white"
          allowFontScaling={false}
          style={styles.icon}
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
            style={styles.headerIcon}
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
  headerIcon: {
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
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
  iconContainerOuter: {
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  iconContainer: {
    width: 92,
    height: 92,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  icon: {
    textAlign: 'center',
    textAlignVertical: 'center',
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