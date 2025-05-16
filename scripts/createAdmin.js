require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Location = require('../models/Location');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food-safety', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Create default location if it doesn't exist, or use existing
    let location = await Location.findOne({ name: 'Main Kitchen' });
    if (!location) {
      location = new Location({
        name: 'Main Kitchen'
      });
      await location.save();
      console.log('Default location created');
    } else {
      console.log('Default location already exists');
    }

    // Check if admin user already exists by username or email
    let adminUser = await User.findOne({ $or: [{ username: 'adminuser' }, { email: 'admin@example.com' }] });

    if (adminUser) {
      console.log('Admin user (adminuser or admin@example.com) already exists.');
      // If the user exists, we might want to ensure their username is set if it wasn't before
      if (!adminUser.username) {
        adminUser.username = 'adminuser';
        await adminUser.save();
        console.log('Existing admin user updated with username: adminuser');
      }
    } else {
      // Create admin user if not found
      console.log('Admin user not found, creating new one...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      adminUser = new User({
        name: 'Admin User',
        username: 'adminuser',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        siteLocation: location._id
      });
      await adminUser.save();
      console.log('Admin user created successfully');
      console.log('Username: adminuser');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
    }

    // Verify the user exists in the database by username
    const userToVerify = await User.findOne({ username: 'adminuser' });
    console.log(`User 'adminuser' in database (verification): ${userToVerify ? 'Found' : 'Not found'}`);

    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
};

createAdminUser(); 