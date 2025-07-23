import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

class NotificationService {
  constructor() {
    this.fcmToken = null;
    this.isInitialized = false;
  }

  // Initialize notification service
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Request permission for notifications
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification authorization granted');
        
        // Get FCM token
        this.fcmToken = await messaging().getToken();
        console.log('FCM Token:', this.fcmToken);
        
        // Save token to AsyncStorage
        await AsyncStorage.setItem('fcmToken', this.fcmToken);
        
        // Send token to backend
        await this.sendTokenToServer(this.fcmToken);
        
        // Set up message handlers
        this.setupMessageHandlers();
        
        this.isInitialized = true;
      } else {
        console.log('Notification authorization denied');
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  // Send FCM token to backend
  async sendTokenToServer(token) {
    try {
      const user = JSON.parse(await AsyncStorage.getItem('user'));
      if (user && user.id) {
        await api.post('/users/fcm-token', {
          userId: user.id,
          fcmToken: token,
          platform: 'android'
        });
        console.log('FCM token sent to server');
      }
    } catch (error) {
      console.error('Error sending FCM token to server:', error);
    }
  }

  // Set up message handlers
  setupMessageHandlers() {
    // Handle foreground messages
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Foreground message received:', remoteMessage);
      this.showLocalNotification(remoteMessage);
    });

    // Handle background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message received:', remoteMessage);
      return Promise.resolve();
    });

    // Handle notification tap when app is in background
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened app:', remoteMessage);
      this.handleNotificationTap(remoteMessage);
    });

    // Handle notification tap when app is closed
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Initial notification:', remoteMessage);
          this.handleNotificationTap(remoteMessage);
        }
      });

    return unsubscribe;
  }

  // Show local notification
  showLocalNotification(remoteMessage) {
    // This would use react-native-push-notification to show a local notification
    // For now, we'll just log it
    console.log('Showing local notification:', remoteMessage.notification?.title);
  }

  // Handle notification tap
  handleNotificationTap(remoteMessage) {
    const { data } = remoteMessage;
    
    if (data && data.type === 'audit_completed') {
      // Navigate to audit details or audit list
      console.log('Navigate to audit:', data.auditId);
      // You would implement navigation logic here
    }
  }

  // Get current FCM token
  async getFCMToken() {
    if (!this.fcmToken) {
      this.fcmToken = await AsyncStorage.getItem('fcmToken');
    }
    return this.fcmToken;
  }

  // Refresh FCM token
  async refreshToken() {
    try {
      this.fcmToken = await messaging().getToken();
      await AsyncStorage.setItem('fcmToken', this.fcmToken);
      await this.sendTokenToServer(this.fcmToken);
      console.log('FCM token refreshed');
    } catch (error) {
      console.error('Error refreshing FCM token:', error);
    }
  }
}

export default new NotificationService(); 