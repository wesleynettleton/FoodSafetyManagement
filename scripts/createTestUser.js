require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Location = require('../models/Location');

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food-safety', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Get or create default location
    let location = await Location.findOne({ name: 'Main Kitchen' });
    if (!location) {
      location = new Location({
        name: 'Main Kitchen'
      });
      await location.save();
      console.log('Default location created');
    }

    // Check if test user already exists
    let testUser = await User.findOne({ username: 'testuser' });

    if (testUser) {
      console.log('Test user already exists.');
      console.log('Username: testuser');
      console.log('Password: testuser');
    } else {
      // Create test user
      console.log('Creating test user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('testuser', salt);
      
      testUser = new User({
        name: 'Test User',
        username: 'testuser',
        email: 'testuser@example.com',
        password: hashedPassword,
        role: 'kitchen_staff',
        siteLocation: location._id
      });
      
      await testUser.save();
      console.log('Test user created successfully!');
      console.log('Username: testuser');
      console.log('Password: testuser');
      console.log('Role: kitchen_staff');
    }

    // Verify the user exists
    const verifyUser = await User.findOne({ username: 'testuser' });
    console.log(`User verification: ${verifyUser ? 'SUCCESS - testuser found in database' : 'FAILED - testuser not found'}`);

    process.exit(0);
  } catch (err) {
    console.error('Error creating test user:', err);
    process.exit(1);
  }
};

createTestUser(); 