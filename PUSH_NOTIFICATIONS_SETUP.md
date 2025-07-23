# Push Notifications Setup Guide

This guide explains how to set up push notifications for the Food Safety Management mobile app.

## Overview

The system sends push notifications to kitchen staff when:
- A new audit is completed for their location
- The notification includes audit details and score

## Prerequisites

1. **Firebase Project**: Create a Firebase project for push notifications
2. **Android App**: Configure Firebase in your React Native Android app
3. **Backend**: Set up Firebase Admin SDK on the server

## Step 1: Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Cloud Messaging (FCM)
4. Add your Android app to the project
5. Download `google-services.json` for Android

## Step 2: Android App Configuration

### Install Dependencies
```bash
cd FoodSafetyMobileNew
npm install @react-native-firebase/app @react-native-firebase/messaging react-native-push-notification
```

### Configure Firebase
1. Place `google-services.json` in `android/app/`
2. Update `android/build.gradle`:
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

3. Update `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### Android Manifest Permissions
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
```

## Step 3: Backend Configuration

### Install Firebase Admin SDK
```bash
npm install firebase-admin
```

### Set up Service Account
1. In Firebase Console, go to Project Settings > Service Accounts
2. Generate new private key
3. Download the JSON file
4. Store it securely (environment variable or secure storage)

### Environment Variables
Add to your `.env` file:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

### Update Notification Service
Update `services/notificationService.js`:
```javascript
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL
};

firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

## Step 4: Testing

### Test Notification Sending
1. Complete an audit in the web app
2. Check server logs for notification sending
3. Verify notification appears on mobile device

### Test Token Registration
1. Login to mobile app
2. Check server logs for FCM token registration
3. Verify token is stored in database

## Step 5: Production Deployment

### Mobile App
1. Build release APK with Firebase configuration
2. Test notifications on real devices
3. Deploy to Google Play Store

### Backend
1. Set up environment variables on production server
2. Test notification sending in production
3. Monitor notification delivery rates

## Troubleshooting

### Common Issues

1. **Notifications not appearing**
   - Check FCM token registration
   - Verify Firebase configuration
   - Check device notification permissions

2. **Token registration failing**
   - Check network connectivity
   - Verify API endpoint is accessible
   - Check authentication token

3. **Backend notification sending failing**
   - Verify Firebase Admin SDK configuration
   - Check service account permissions
   - Monitor server logs for errors

### Debug Commands

```bash
# Check FCM tokens in database
mongo
db.users.find({}, {fcmTokens: 1})

# Test notification sending
curl -X POST http://localhost:5000/api/test-notification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"userId": "USER_ID", "message": "Test notification"}'
```

## Security Considerations

1. **Service Account Key**: Store securely, never commit to git
2. **Token Validation**: Validate FCM tokens on server
3. **Rate Limiting**: Implement rate limiting for notification sending
4. **User Consent**: Ensure users opt-in to notifications

## Monitoring

1. **Delivery Rates**: Monitor notification delivery success rates
2. **Error Logs**: Track notification sending errors
3. **User Engagement**: Monitor notification open rates
4. **Token Cleanup**: Regularly clean up invalid FCM tokens

## Support

For issues with push notifications:
1. Check Firebase Console for delivery status
2. Review server logs for error messages
3. Test with Firebase Console's test messaging feature
4. Verify device-specific settings 