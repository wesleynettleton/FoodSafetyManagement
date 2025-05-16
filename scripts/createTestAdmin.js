require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Location = require('../models/Location');

const createTestAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food-safety', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Create test location if it doesn't exist, or use existing
    let location = await Location.findOne({ name: 'Test Kitchen' });
    if (!location) {
      location = new Location({
        name: 'Test Kitchen'
      });
      await location.save();
      console.log('Test location created');
    } else {
      console.log('Test location already exists');
    }

    // Check if test admin user already exists by username or email
    let testAdminUser = await User.findOne({ $or: [{ username: 'testadmin' }, { email: 'test@example.com' }] });

    if (testAdminUser) {
      console.log('Test admin user (testadmin or test@example.com) already exists.');
      // If the user exists, we might want to ensure their username is set if it wasn't before
      if (!testAdminUser.username) {
        testAdminUser.username = 'testadmin';
        await testAdminUser.save();
        console.log('Existing test admin user updated with username: testadmin');
      }
    } else {
      // Create test admin user if not found
      console.log('Test admin user not found, creating new one...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('test123', salt);
      testAdminUser = new User({
        name: 'Test Admin',
        username: 'testadmin',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'admin',
        siteLocation: location._id
      });
      await testAdminUser.save();
      console.log('Test admin user created successfully');
      console.log('Username: testadmin');
      console.log('Email: test@example.com');
      console.log('Password: test123');
    }

    // Verify the user exists in the database by username
    const userToVerify = await User.findOne({ username: 'testadmin' });
    console.log(`User 'testadmin' in database (verification): ${userToVerify ? 'Found' : 'Not found'}`);

    process.exit(0);
  } catch (err) {
    console.error('Error creating test admin user:', err);
    process.exit(1);
  }
};

createTestAdmin(); 