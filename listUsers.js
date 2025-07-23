require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const listUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food-safety', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);
    
    // Get all users
    const users = await User.find({}, 'username email role name').lean();
    
    console.log('Found', users.length, 'users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Username: "${user.username}", Email: "${user.email}", Role: "${user.role}", Name: "${user.name}"`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error listing users:', err);
    process.exit(1);
  }
};

listUsers(); 