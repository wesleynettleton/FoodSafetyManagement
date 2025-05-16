const mongoose = require('mongoose');
require('dotenv').config();

const { FoodTemperature } = require('./models/Record');
const User = require('./models/User');

async function createTestRecord() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/food-safety');
        console.log('MongoDB Connected');

        // Find the user
        const user = await User.findOne({ username: 'sleaford' });
        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('User found:', {
            id: user._id,
            username: user.username,
            role: user.role,
            siteLocation: user.siteLocation
        });

        // Create a test food temperature record
        const record = new FoodTemperature({
            type: 'food_temperature',
            foodName: 'Test Food',
            temperature: 75,
            location: user.siteLocation,
            createdBy: user._id
        });

        await record.save();
        console.log('Test record created:', record);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

createTestRecord(); 