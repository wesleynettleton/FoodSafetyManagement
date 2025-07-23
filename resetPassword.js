require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const resetPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food-safety', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to local MongoDB');

    // Find the sleaford user
    const user = await User.findOne({ username: 'sleaford' });
    
    if (!user) {
      console.log('User sleaford not found in local database');
      process.exit(1);
    }

    console.log('Found user sleaford:', {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    // Hash the new password
    const newPassword = 'sleaford123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the user's password
    user.password = hashedPassword;
    await user.save();
    
    console.log('Password updated successfully for user: sleaford');
    console.log('New password: sleaford123');
    
    process.exit(0);
  } catch (err) {
    console.error('Error resetting password:', err);
    process.exit(1);
  }
};

resetPassword(); 