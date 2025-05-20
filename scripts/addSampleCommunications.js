const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Communication = require('../models/Communication');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const sampleCommunications = [
  {
    title: "Important: New Food Safety Guidelines",
    content: "Please note that we have updated our food safety guidelines. All staff must review the new temperature requirements for hot and cold food storage. The new guidelines are now posted in the kitchen.",
    priority: "high",
    author: null // Will be set to admin user
  },
  {
    title: "Weekly Equipment Maintenance",
    content: "Reminder: All fridges and freezers will be serviced this Thursday between 2-4 PM. Please ensure all food items are properly stored and labeled before the maintenance period.",
    priority: "medium",
    author: null
  },
  {
    title: "New Staff Training Session",
    content: "Welcome to our new team members! A mandatory food safety training session will be held this Friday at 10 AM in the main kitchen. All new staff must attend.",
    priority: "medium",
    author: null
  },
  {
    title: "Holiday Schedule Update",
    content: "The kitchen will be operating on a modified schedule during the upcoming holiday period. Please check the updated roster posted in the staff room.",
    priority: "low",
    author: null
  },
  {
    title: "URGENT: Temperature Log Issue",
    content: "We've noticed some inconsistencies in the temperature logs. Please ensure all temperature readings are recorded immediately after taking them. Double-check your entries before submitting.",
    priority: "high",
    author: null
  }
];

const addSampleCommunications = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food-safety', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Find an admin user to set as the author
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      throw new Error('No admin user found in the database');
    }

    // Add author to all communications
    const communicationsWithAuthor = sampleCommunications.map(comm => ({
      ...comm,
      author: adminUser._id
    }));

    // Insert the communications
    await Communication.insertMany(communicationsWithAuthor);
    console.log('Sample communications added successfully');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error adding sample communications:', error);
    process.exit(1);
  }
};

// Run the script
addSampleCommunications(); 