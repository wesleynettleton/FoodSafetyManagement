/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import notificationService from './src/services/notificationService';

const App = () => {
  useEffect(() => {
    // Initialize notification service
    notificationService.initialize();
  }, []);

  return <AppNavigator />;
};

export default App;
