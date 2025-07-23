const admin = require('firebase-admin');
const User = require('../models/User');

// Initialize Firebase Admin SDK
// Note: You'll need to add your Firebase service account key
// This should be stored securely and not committed to git
let firebaseApp;

try {
    // For now, we'll use a placeholder. In production, you'd load the service account key
    firebaseApp = admin.initializeApp({
        // credential: admin.credential.cert(serviceAccountKey),
        projectId: 'your-firebase-project-id'
    });
} catch (error) {
    console.log('Firebase already initialized or not configured');
}

class NotificationService {
    constructor() {
        this.messaging = firebaseApp ? admin.messaging() : null;
    }

    // Send notification to specific user
    async sendToUser(userId, notification) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
                console.log(`No FCM tokens found for user ${userId}`);
                return false;
            }

            const tokens = user.fcmTokens.map(token => token.token);
            
            const message = {
                notification: {
                    title: notification.title,
                    body: notification.body
                },
                data: notification.data || {},
                tokens: tokens
            };

            if (this.messaging) {
                const response = await this.messaging.sendMulticast(message);
                console.log(`Sent notification to user ${userId}:`, response);
                return response.successCount > 0;
            } else {
                console.log('Firebase messaging not initialized');
                return false;
            }
        } catch (error) {
            console.error('Error sending notification to user:', error);
            return false;
        }
    }

    // Send notification to users at specific location
    async sendToLocation(locationId, notification) {
        try {
            const users = await User.find({ 
                siteLocation: locationId,
                'fcmTokens.0': { $exists: true } // Users with FCM tokens
            });

            if (users.length === 0) {
                console.log(`No users with FCM tokens found for location ${locationId}`);
                return false;
            }

            const tokens = users.flatMap(user => 
                user.fcmTokens.map(token => token.token)
            );

            const message = {
                notification: {
                    title: notification.title,
                    body: notification.body
                },
                data: notification.data || {},
                tokens: tokens
            };

            if (this.messaging) {
                const response = await this.messaging.sendMulticast(message);
                console.log(`Sent notification to location ${locationId}:`, response);
                return response.successCount > 0;
            } else {
                console.log('Firebase messaging not initialized');
                return false;
            }
        } catch (error) {
            console.error('Error sending notification to location:', error);
            return false;
        }
    }

    // Send audit completion notification
    async sendAuditCompletedNotification(audit) {
        try {
            const notification = {
                title: 'New Audit Completed',
                body: `Audit completed for ${audit.location.name} by ${audit.auditor}`,
                data: {
                    type: 'audit_completed',
                    auditId: audit._id.toString(),
                    locationId: audit.location._id.toString(),
                    score: audit.score ? audit.score.toString() : '0'
                }
            };

            // Send to kitchen staff at the audited location
            const success = await this.sendToLocation(audit.location._id, notification);
            
            if (success) {
                console.log(`Audit completion notification sent for location ${audit.location.name}`);
            } else {
                console.log(`Failed to send audit completion notification for location ${audit.location.name}`);
            }

            return success;
        } catch (error) {
            console.error('Error sending audit completion notification:', error);
            return false;
        }
    }

    // Clean up invalid tokens
    async cleanupInvalidTokens(userId, invalidTokens) {
        try {
            const user = await User.findById(userId);
            if (!user) return;

            user.fcmTokens = user.fcmTokens.filter(token => 
                !invalidTokens.includes(token.token)
            );

            await user.save();
            console.log(`Cleaned up ${invalidTokens.length} invalid tokens for user ${userId}`);
        } catch (error) {
            console.error('Error cleaning up invalid tokens:', error);
        }
    }
}

module.exports = new NotificationService(); 