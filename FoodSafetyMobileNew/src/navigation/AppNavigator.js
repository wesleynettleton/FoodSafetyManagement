import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FoodTemperatureScreen from '../screens/FoodTemperatureScreen';
import RecordsScreen from '../screens/RecordsScreen';
import RecordListScreen from '../screens/RecordListScreen';
import ProbeCalibrationScreen from '../screens/ProbeCalibrationScreen';
import DeliveryScreen from '../screens/DeliveryScreen';
import CoolingTemperatureScreen from '../screens/CoolingTemperatureScreen';
import EquipmentTemperatureScreen from '../screens/EquipmentTemperatureScreen';
import TakeRecordsScreen from '../screens/TakeRecordsScreen';
import ChecklistsScreen from '../screens/ChecklistsScreen';
import WeeklyChecksScreen from '../screens/WeeklyChecksScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder screens for now
const PlaceholderScreen = ({ route }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>{route.name} Screen</Text>
    <Text style={{ marginTop: 10, color: '#666' }}>Coming Soon</Text>
  </View>
);

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Records') {
            iconName = 'list';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1976d2',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Records" component={RecordsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={PlaceholderScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="TakeRecords" component={TakeRecordsScreen} />
        <Stack.Screen name="FoodTemperature" component={FoodTemperatureScreen} />
        <Stack.Screen name="RecordList" component={RecordListScreen} />
        <Stack.Screen name="ProbeCalibration" component={ProbeCalibrationScreen} />
        <Stack.Screen name="Delivery" component={DeliveryScreen} />
        <Stack.Screen name="EquipmentTemperature" component={EquipmentTemperatureScreen} />
        <Stack.Screen name="CoolingTemperature" component={CoolingTemperatureScreen} />
        <Stack.Screen name="Checklists" component={ChecklistsScreen} />
        <Stack.Screen name="WeeklyChecks" component={WeeklyChecksScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 