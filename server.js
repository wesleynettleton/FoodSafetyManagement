const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();

// CORS middleware - update for production
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL] 
  : ['http://localhost:3000', 'http://localhost:3001'];

if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
  console.warn('Warning: FRONTEND_URL environment variable is not set in production');
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware - only log in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
  });
}

// MongoDB Connection with retry logic
console.log('MONGODB_URI:', process.env.MONGODB_URI); // DEBUG: Print the MongoDB URI
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI && process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI environment variable is required in production');
    }
    
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    if (process.env.NODE_ENV === 'production') {
      // In production, exit if we can't connect to the database
      process.exit(1);
    } else {
      // In development, retry connection after 5 seconds
      setTimeout(connectDB, 5000);
    }
  }
};

connectDB();

// Import models to ensure they are registered
require('./models/Location');
require('./models/User');
require('./models/Equipment');
require('./models/Record');

// API Routes
const auth = require('./routes/auth');
const users = require('./routes/users');
const records = require('./routes/records');
const equipment = require('./routes/equipment');
const locations = require('./routes/locations');

// Define Routes
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use('/api/records', records);
app.use('/api/equipment', equipment);
app.use('/api/locations', locations);

// Serve static files from the React build directory
const buildPath = path.join(__dirname, 'client/build');
console.log('Build directory path:', buildPath);
console.log('Build directory exists:', require('fs').existsSync(buildPath));
console.log('Build directory contents:', require('fs').readdirSync(buildPath));

app.use(express.static(buildPath));

// Add logging for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  console.log('Attempting to serve index.html from:', indexPath);
  console.log('index.html exists:', require('fs').existsSync(indexPath));
  res.sendFile(indexPath);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
}); 