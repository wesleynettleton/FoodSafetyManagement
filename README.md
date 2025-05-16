# Food Safety Management System

A comprehensive web application for managing food safety records across multiple kitchen locations.

## Features

- User Management (Admin)
  - Create, update, and delete users
  - Assign users to specific locations
  - Role-based access control (Admin/Kitchen Staff)

- Location Management (Admin)
  - Add and manage kitchen locations
  - View records by location

- Record Management
  - Food Temperature Records
  - Probe Calibration Records
  - Delivery Records
  - Fridge/Freezer Temperature Records

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/food-safety
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/user - Get current user

### Users (Admin only)
- GET /api/users - Get all users
- POST /api/users - Create a user
- PUT /api/users/:id - Update a user
- DELETE /api/users/:id - Delete a user

### Locations (Admin only)
- POST /api/locations - Create a location
- GET /api/locations - Get all locations
- DELETE /api/locations/:id - Delete a location

### Records
- POST /api/records/food-temperature - Create food temperature record
- POST /api/records/probe-calibration - Create probe calibration record
- POST /api/records/delivery - Create delivery record
- POST /api/records/temperature - Create fridge/freezer temperature record
- GET /api/records/:type - Get records by type for current location
- GET /api/records/admin/:type/:locationId - Get records by type for specific location (admin only)

## Security

- All routes except login and register require authentication
- Admin-only routes are protected by role-based middleware
- Passwords are hashed using bcrypt
- JWT tokens are used for authentication

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- Express Validator 