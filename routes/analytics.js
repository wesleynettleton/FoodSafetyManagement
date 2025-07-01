const express = require('express');
const router = express.Router();
const { 
  FoodTemperature, 
  ProbeCalibration, 
  Delivery, 
  TemperatureRecord, 
  CoolingTemperature, 
  WeeklyRecord 
} = require('../models/Record');
const Location = require('../models/Location');
const auth = require('../middleware/auth');

// Test route to verify analytics API is working
router.get('/test', (req, res) => {
  res.json({ message: 'Analytics API is working', timestamp: new Date().toISOString() });
});

// Get analytics data
router.get('/', auth, async (req, res) => {
  try {
    console.log('Analytics API called by user:', req.user?.id, 'role:', req.user?.role);
    const { location } = req.query;
    console.log('Location filter:', location);
    
    // Fetch the full user object to get siteLocation
    const User = require('../models/User');
    const fullUser = await User.findById(req.user.id).populate('siteLocation');
    if (!fullUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Full user data:', {
      id: fullUser._id,
      role: fullUser.role,
      siteLocation: fullUser.siteLocation
    });
    
    // Base query filter - restrict by user role
    let locationFilter = {};
    let allowedLocations = [];
    
    if (fullUser.role === 'admin') {
      // Admin can see all locations or filter by specific location
      if (location && location !== 'all') {
        locationFilter = { location: location };
      }
      allowedLocations = await Location.find(); // Admin sees all locations
    } else {
      // Kitchen users can only see their assigned location
      if (fullUser.siteLocation) {
        locationFilter = { location: fullUser.siteLocation._id };
        allowedLocations = [fullUser.siteLocation];
      } else {
        return res.status(403).json({ message: 'No location assigned to user' });
      }
    }
    
    console.log('User role filter applied. Allowed locations:', allowedLocations.length);

    // Use the allowed locations based on user role
    const locations = allowedLocations;
    
    // Get total record counts from all record types
    const [foodTempCount, probeCalCount, deliveryCount, tempRecordCount, coolingTempCount, weeklyRecordCount] = await Promise.all([
      FoodTemperature.countDocuments(locationFilter),
      ProbeCalibration.countDocuments(locationFilter),
      Delivery.countDocuments(locationFilter),
      TemperatureRecord.countDocuments(locationFilter),
      CoolingTemperature.countDocuments(locationFilter),
      WeeklyRecord.countDocuments(locationFilter)
    ]);
    const totalRecords = foodTempCount + probeCalCount + deliveryCount + tempRecordCount + coolingTempCount + weeklyRecordCount;
    
    // Get records from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRecordsPromises = [
      FoodTemperature.find({ ...locationFilter, createdAt: { $gte: thirtyDaysAgo } }).populate('location', 'name'),
      ProbeCalibration.find({ ...locationFilter, createdAt: { $gte: thirtyDaysAgo } }).populate('location', 'name'),
      Delivery.find({ ...locationFilter, createdAt: { $gte: thirtyDaysAgo } }).populate('location', 'name'),
      TemperatureRecord.find({ ...locationFilter, createdAt: { $gte: thirtyDaysAgo } }).populate('location', 'name'),
      CoolingTemperature.find({ ...locationFilter, createdAt: { $gte: thirtyDaysAgo } }).populate('location', 'name'),
      WeeklyRecord.find({ ...locationFilter, createdAt: { $gte: thirtyDaysAgo } }).populate('location', 'name')
    ];
    
    const [foodTemps, probeCals, deliveries, tempRecords, coolingTemps, weeklyRecords] = await Promise.all(recentRecordsPromises);
    
    // Combine all records and add type field for identification
    const recentRecords = [
      ...foodTemps.map(r => ({ ...r.toObject(), type: 'food-temperature' })),
      ...probeCals.map(r => ({ ...r.toObject(), type: 'probe-calibration' })),
      ...deliveries.map(r => ({ ...r.toObject(), type: 'delivery' })),
      ...tempRecords.map(r => ({ ...r.toObject(), type: 'equipment-temperature' })),
      ...coolingTemps.map(r => ({ ...r.toObject(), type: 'cooling-temperature' })),
      ...weeklyRecords.map(r => ({ ...r.toObject(), type: 'weekly-record' }))
    ];

    // Calculate compliance rate
    const totalRecentRecords = recentRecords.length;
    const compliantRecords = recentRecords.filter(record => {
      if (record.type === 'food-temperature') {
        // Hot food should be ≥63°C (safe holding temperature)
        return record.temperature >= 63;
      }
      if (record.type === 'equipment-temperature' || record.type === 'delivery') {
        // Equipment and delivery temperatures should be cold (≤5°C) 
        return record.temperature <= 5;
      }
      if (record.type === 'cooling-temperature') {
        // For cooling records, check the final temperature after 2 hours should be ≤5°C
        return record.temperatureAfter2Hours <= 5;
      }
      if (record.type === 'weekly-record') {
        const checklist = record.checklistData;
        if (!checklist) return true;
        
        // Check if any items are marked as "No"
        for (const [key, value] of Object.entries(checklist)) {
          if (typeof value === 'object' && value.value === 'No') {
            return false;
          }
        }
        return true;
      }
      return true; // Default to compliant for other types (probe calibration)
    });
    
    const complianceRate = totalRecentRecords > 0 
      ? ((compliantRecords.length / totalRecentRecords) * 100).toFixed(1)
      : 100;

    // Get critical alerts (non-compliant items)
    const criticalAlerts = totalRecentRecords - compliantRecords.length;

    // Generate compliance by location
    const complianceByLocation = await Promise.all(
      locations.map(async (loc) => {
        const locationRecords = recentRecords.filter(
          record => record.location._id.toString() === loc._id.toString()
        );
        
        const compliant = locationRecords.filter(record => {
          if (record.type === 'food-temperature') {
            // Hot food should be ≥63°C (safe holding temperature)
            return record.temperature >= 63;
          }
          if (record.type === 'equipment-temperature' || record.type === 'delivery') {
            // Equipment and delivery temperatures should be cold (≤5°C) 
            return record.temperature <= 5;
          }
          if (record.type === 'cooling-temperature') {
            return record.temperatureAfter2Hours <= 5;
          }
          if (record.type === 'weekly-record') {
            const checklist = record.checklistData;
            if (!checklist) return true;
            
            for (const [key, value] of Object.entries(checklist)) {
              if (typeof value === 'object' && value.value === 'No') {
                return false;
              }
            }
            return true;
          }
          return true;
        }).length;

        const nonCompliant = locationRecords.length - compliant;

        return {
          location: loc.name,
          compliant,
          nonCompliant,
          pending: 0 // No pending items tracked yet
        };
      })
    );

    // Generate temperature trends for last 7 days
    const temperatureTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      // Get temperature records for the day from all relevant collections
      const [dayFoodTemps, dayTempRecords, dayCoolingTemps] = await Promise.all([
        FoodTemperature.find({ ...locationFilter, createdAt: { $gte: dayStart, $lte: dayEnd } }),
        TemperatureRecord.find({ ...locationFilter, createdAt: { $gte: dayStart, $lte: dayEnd } }),
        CoolingTemperature.find({ ...locationFilter, createdAt: { $gte: dayStart, $lte: dayEnd } })
      ]);
      
      const dayRecords = [
        ...dayFoodTemps,
        ...dayTempRecords, 
        ...dayCoolingTemps
      ];

      const temperatures = dayRecords
        .filter(record => {
          // For cooling temperatures, use temperatureAfter2Hours, for others use temperature
          return record.temperature !== undefined || record.temperatureAfter2Hours !== undefined;
        })
        .map(record => {
          // Return the appropriate temperature field
          return record.temperature !== undefined ? record.temperature : record.temperatureAfter2Hours;
        });
      
      const avgTemp = temperatures.length > 0 
        ? (temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length).toFixed(1)
        : 0;
      
      // For simplicity, mark temperatures in danger zone (5-63°C) as critical
      // This assumes most temperatures are food temperatures
      const critical = temperatures.filter(temp => temp > 5 && temp < 63).length;

      temperatureTrends.push({
        date: dayStart.toISOString().split('T')[0],
        avgTemp: parseFloat(avgTemp),
        critical
      });
    }

    // Generate recent alerts
    const recentAlerts = [];
    
    // Temperature alerts
    const alertRecords = recentRecords.filter(record => {
      if (record.type === 'food-temperature') {
        // Alert if food temperature is below 63°C (danger zone)
        return record.temperature < 63;
      }
      if (record.type === 'equipment-temperature' || record.type === 'delivery') {
        // Alert if equipment/delivery temperature is above 5°C
        return record.temperature > 5;
      }
      if (record.type === 'cooling-temperature') {
        return record.temperatureAfter2Hours > 5;
      }
      return false;
    }).slice(0, 3);

    alertRecords.forEach((record, index) => {
      const temp = record.temperature || record.temperatureAfter2Hours;
      const typeNames = {
        'food-temperature': 'Food',
        'equipment-temperature': 'Equipment',
        'delivery': 'Delivery',
        'cooling-temperature': 'Cooling'
      };
      
      let message;
      if (record.type === 'food-temperature') {
        message = `Food temperature below 63°C (${temp}°C) - danger zone`;
      } else if (record.type === 'cooling-temperature') {
        message = `Cooling temperature above 5°C (${temp}°C)`;
      } else {
        message = `${typeNames[record.type] || 'Temperature'} above 5°C (${temp}°C)`;
      }
      
      recentAlerts.push({
        id: `temp-${index}`,
        type: 'Temperature',
        message: message,
        location: record.location?.name || 'Unknown',
        severity: record.type === 'food-temperature' && temp < 40 ? 'high' : 'medium',
        time: getRelativeTime(record.createdAt)
      });
    });

    // Compliance alerts from weekly records
    const nonCompliantWeekly = recentRecords.filter(record => {
      if (record.type !== 'weekly-record') return false;
      const checklist = record.checklistData;
      if (!checklist) return false;
      
      for (const [key, value] of Object.entries(checklist)) {
        if (typeof value === 'object' && value.value === 'No') {
          return true;
        }
      }
      return false;
    }).slice(0, 2);

    nonCompliantWeekly.forEach((record, index) => {
      recentAlerts.push({
        id: `compliance-${index}`,
        type: 'Compliance',
        message: 'Weekly checklist has non-compliant items',
        location: record.location?.name || 'Unknown',
        severity: 'medium',
        time: getRelativeTime(record.createdAt)
      });
    });

    // Add some mock equipment alerts if we have room
    if (recentAlerts.length < 5) {
      recentAlerts.push({
        id: 'equipment-1',
        type: 'Equipment',
        message: 'Probe calibration due',
        location: locations[0]?.name || 'Kitchen',
        severity: 'low',
        time: '3 days ago'
      });
    }

    const analytics = {
      overview: {
        totalRecords,
        complianceRate: parseFloat(complianceRate),
        criticalAlerts,
        locationsMonitored: locations.length
      },
      compliance: complianceByLocation,
      temperatureTrends,
      recentAlerts: recentAlerts.slice(0, 5) // Limit to 5 most recent
    };

    console.log('Analytics data successfully generated:', {
      totalRecords: analytics.overview.totalRecords,
      complianceRate: analytics.overview.complianceRate,
      alertsCount: analytics.recentAlerts.length
    });
    
    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error fetching analytics data', error: error.message });
  }
});

// Helper function to get relative time
function getRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
}

module.exports = router; 