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

// Get probe calibration status for all locations
router.get('/probe-calibration-status', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const fullUser = await User.findById(req.user.id).populate('siteLocation');
    
    // Set up location filter based on user role
    let locations;
    if (fullUser.role === 'admin') {
      locations = await Location.find();
    } else {
      if (fullUser.siteLocation) {
        locations = [fullUser.siteLocation];
      } else {
        return res.status(403).json({ message: 'No location assigned to user' });
      }
    }

    const probeCalibrationStatus = await getProbeCalibrationStatus(locations);
    
    res.json({
      locations: probeCalibrationStatus,
      summary: {
        totalProbes: probeCalibrationStatus.reduce((sum, loc) => sum + loc.probes.length, 0),
        overdue: probeCalibrationStatus.reduce((sum, loc) => sum + loc.overdue, 0),
        dueSoon: probeCalibrationStatus.reduce((sum, loc) => sum + loc.dueSoon, 0),
        upToDate: probeCalibrationStatus.reduce((sum, loc) => sum + loc.upToDate, 0)
      }
    });
  } catch (error) {
    console.error('Probe calibration status error:', error);
    res.status(500).json({ message: 'Error fetching probe calibration status' });
  }
});

// Get daily temperature reading status (weekdays only)
router.get('/temperature-reading-status', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const fullUser = await User.findById(req.user.id).populate('siteLocation');
    
    // Set up location filter based on user role
    let locations;
    if (fullUser.role === 'admin') {
      locations = await Location.find();
    } else {
      if (fullUser.siteLocation) {
        locations = [fullUser.siteLocation];
      } else {
        return res.status(403).json({ message: 'No location assigned to user' });
      }
    }

    const temperatureReadingStatus = await getTemperatureReadingStatus(locations);
    
    res.json({
      locations: temperatureReadingStatus,
      summary: {
        totalLocations: temperatureReadingStatus.length,
        missedToday: temperatureReadingStatus.filter(loc => 
          !loc.fridgeReadingToday || !loc.freezerReadingToday
        ).length,
        missedYesterday: temperatureReadingStatus.filter(loc => 
          !loc.fridgeReadingYesterday || !loc.freezerReadingYesterday
        ).length,
        compliantToday: temperatureReadingStatus.filter(loc => 
          loc.fridgeReadingToday && loc.freezerReadingToday
        ).length
      }
    });
  } catch (error) {
    console.error('Temperature reading status error:', error);
    res.status(500).json({ message: 'Error fetching temperature reading status' });
  }
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
        // BUT if temperature is ≤10°C, it's likely a cold storage temp and should be compliant
        return record.temperature >= 63 || record.temperature <= 10;
      }
      if (record.type === 'equipment-temperature' || record.type === 'delivery') {
        // Equipment and delivery temperatures should be cold (≤5°C) 
        return record.temperature <= 5;
      }
      if (record.type === 'cooling-temperature') {
        // For cooling records, check the final temperature after 2 hours should be ≤8°C
        return record.temperatureAfter2Hours <= 8;
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
            // BUT if temperature is ≤10°C, it's likely a cold storage temp and should be compliant
            return record.temperature >= 63 || record.temperature <= 10;
          }
          if (record.type === 'equipment-temperature' || record.type === 'delivery') {
            // Equipment and delivery temperatures should be cold (≤5°C) 
            return record.temperature <= 5;
          }
          if (record.type === 'cooling-temperature') {
            return record.temperatureAfter2Hours <= 8;
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
          // For cooling temperatures, only use temperatureAfter2Hours, for others use temperature
          if (record.temperatureAfter2Hours !== undefined) {
            // This is a cooling temperature - only use the 2-hour reading
            return record.temperatureAfter2Hours !== undefined;
          }
          return record.temperature !== undefined;
        })
        .map(record => {
          // Return the appropriate temperature field - ONLY 2-hour temp for cooling
          if (record.temperatureAfter2Hours !== undefined) {
            return record.temperatureAfter2Hours;
          }
          return record.temperature;
        });
      
      const avgTemp = temperatures.length > 0 
        ? (temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length).toFixed(1)
        : 0;
      
      // Calculate critical temperatures based on record type
      let critical = 0;
      dayRecords.forEach(record => {
        let temp;
        
        // Determine if this temperature reading is critical based on its type
        if (record.temperatureAfter2Hours !== undefined) {
          // This is a cooling temperature - ONLY use the 2-hour temperature
          temp = record.temperatureAfter2Hours;
          if (temp > 8) critical++;
        } else if (record.equipmentType === 'fridge' || record.equipmentType === 'freezer') {
          // This is equipment temp - use regular temperature field
          temp = record.temperature;
          if (temp > 5) critical++;
        } else {
          // This might be hot food temp - use regular temperature field
          temp = record.temperature;
          if (temp > 10 && temp < 63) critical++;
        }
      });

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
        // Only alert for hot food temperatures below 63°C if they're actually meant to be hot
        // Skip temperatures that are clearly fridge/freezer temps (below 10°C)
        return record.temperature < 63 && record.temperature > 10;
      }
      if (record.type === 'equipment-temperature' || record.type === 'delivery') {
        // Alert if equipment/delivery temperature is above 5°C
        return record.temperature > 5;
      }
      if (record.type === 'cooling-temperature') {
        return record.temperatureAfter2Hours > 8;
      }
      return false;
    }).slice(0, 3);

    alertRecords.forEach((record, index) => {
      let temp;
      
      // Get the correct temperature field for each record type
      if (record.type === 'cooling-temperature') {
        temp = record.temperatureAfter2Hours; // ONLY use 2-hour temp for cooling
      } else {
        temp = record.temperature;
      }
      
      const typeNames = {
        'food-temperature': 'Food',
        'equipment-temperature': 'Equipment',
        'delivery': 'Delivery',
        'cooling-temperature': 'Cooling'
      };
      
      let message;
      if (record.type === 'food-temperature') {
        message = `Hot food temperature in danger zone (${temp}°C) - should be ≥63°C`;
      } else if (record.type === 'cooling-temperature') {
        message = `Cooling temperature after 2 hours above 8°C (${temp}°C)`;
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

    // Check for probe calibrations that are due (monthly schedule)
    const probeCalibrationAlerts = await checkProbeCalibrationsDue(locations);
    recentAlerts.push(...probeCalibrationAlerts);

    // Check for daily temperature readings (weekdays only)
    const temperatureReadingAlerts = await checkDailyTemperatureReadings(locations);
    recentAlerts.push(...temperatureReadingAlerts);

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

// Compliance Reports for Inspections/Audits
router.get('/compliance-report', auth, async (req, res) => {
  try {
    const { startDate, endDate, location, reportType = 'full' } = req.query;
    
    // Validate date range
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date
    
    // Get user permissions
    const User = require('../models/User');
    const fullUser = await User.findById(req.user.id).populate('siteLocation');
    
    // Set up location filter based on user role
    let locationFilter = {};
    let allowedLocations = [];
    
    if (fullUser.role === 'admin') {
      if (location && location !== 'all') {
        locationFilter = { location: location };
        const loc = await Location.findById(location);
        allowedLocations = loc ? [loc] : [];
      } else {
        allowedLocations = await Location.find();
      }
    } else {
      if (fullUser.siteLocation) {
        locationFilter = { location: fullUser.siteLocation._id };
        allowedLocations = [fullUser.siteLocation];
      } else {
        return res.status(403).json({ message: 'No location assigned to user' });
      }
    }
    
    // Add date filter
    const dateFilter = {
      ...locationFilter,
      createdAt: { $gte: start, $lte: end }
    };
    
    // Fetch all records within date range
    const [foodTemps, probeCalibrations, deliveries, tempRecords, coolingTemps, weeklyRecords] = await Promise.all([
      FoodTemperature.find(dateFilter).populate('location', 'name').populate('createdBy', 'username').sort({ createdAt: -1 }),
      ProbeCalibration.find(dateFilter).populate('location', 'name').populate('createdBy', 'username').sort({ createdAt: -1 }),
      Delivery.find(dateFilter).populate('location', 'name').populate('createdBy', 'username').sort({ createdAt: -1 }),
      TemperatureRecord.find(dateFilter).populate('location', 'name').populate('createdBy', 'username').sort({ createdAt: -1 }),
      CoolingTemperature.find(dateFilter).populate('location', 'name').populate('createdBy', 'username').sort({ createdAt: -1 }),
      WeeklyRecord.find(dateFilter).populate('location', 'name').populate('createdBy', 'username').sort({ createdAt: -1 })
    ]);
    
    // Analyze compliance for each record type
    const complianceAnalysis = {
      foodTemperature: analyzeTemperatureCompliance(foodTemps, 'food'),
      equipmentTemperature: analyzeTemperatureCompliance(tempRecords, 'equipment'),
      deliveryTemperature: analyzeTemperatureCompliance(deliveries, 'delivery'),
      coolingTemperature: analyzeCoolingCompliance(coolingTemps),
      probeCalibration: analyzeProbeCompliance(probeCalibrations),
      weeklyChecklists: analyzeWeeklyCompliance(weeklyRecords)
    };
    
    // Calculate overall compliance metrics
    const totalRecords = foodTemps.length + tempRecords.length + deliveries.length + 
                        coolingTemps.length + probeCalibrations.length + weeklyRecords.length;
    
    const totalCompliant = Object.values(complianceAnalysis).reduce((sum, analysis) => 
      sum + analysis.compliant, 0);
    
    const overallComplianceRate = totalRecords > 0 ? 
      ((totalCompliant / totalRecords) * 100).toFixed(2) : 100;
    
    // Generate violations summary
    const violations = generateViolationsSummary(complianceAnalysis);
    
    // Create the compliance report
    const complianceReport = {
      reportMetadata: {
        generatedAt: new Date().toISOString(),
        reportPeriod: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          daysCovered: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        },
        locations: allowedLocations.map(loc => ({ id: loc._id, name: loc.name })),
        reportType: reportType,
        generatedBy: {
          username: fullUser.username,
          role: fullUser.role
        }
      },
      
      executiveSummary: {
        totalRecords,
        overallComplianceRate: parseFloat(overallComplianceRate),
        totalViolations: violations.length,
        criticalViolations: violations.filter(v => v.severity === 'critical').length,
        recordTypes: {
          foodTemperature: foodTemps.length,
          equipmentTemperature: tempRecords.length,
          deliveryTemperature: deliveries.length,
          coolingTemperature: coolingTemps.length,
          probeCalibration: probeCalibrations.length,
          weeklyChecklists: weeklyRecords.length
        }
      },
      
      complianceAnalysis,
      violations,
      
      // Detailed records (only included in full reports)
      ...(reportType === 'full' && {
        detailedRecords: {
          foodTemperature: foodTemps,
          equipmentTemperature: tempRecords,
          deliveryTemperature: deliveries,
          coolingTemperature: coolingTemps,
          probeCalibration: probeCalibrations,
          weeklyChecklists: weeklyRecords
        }
      }),
      
      // Corrective actions taken
      correctiveActions: await generateCorrectiveActions(violations, start, end),
      
      // Recommendations
      recommendations: generateRecommendations(complianceAnalysis, violations)
    };
    
    res.json(complianceReport);
    
  } catch (error) {
    console.error('Compliance report error:', error);
    res.status(500).json({ message: 'Error generating compliance report', error: error.message });
  }
});

// PDF Export endpoint
router.get('/compliance-report/pdf', auth, async (req, res) => {
  try {
    const { startDate, endDate, location, reportType = 'full' } = req.query;
    
    // Get the same report data
    const User = require('../models/User');
    const fullUser = await User.findById(req.user.id).populate('siteLocation');
    
    // Set up location filter based on user role
    let locationFilter = {};
    let allowedLocations = [];
    
    if (fullUser.role === 'admin') {
      if (location && location !== 'all') {
        locationFilter = { location: location };
        const loc = await Location.findById(location);
        allowedLocations = loc ? [loc] : [];
      } else {
        allowedLocations = await Location.find();
      }
    } else {
      if (fullUser.siteLocation) {
        locationFilter = { location: fullUser.siteLocation._id };
        allowedLocations = [fullUser.siteLocation];
      } else {
        return res.status(403).json({ message: 'No location assigned to user' });
      }
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    const dateFilter = {
      ...locationFilter,
      createdAt: { $gte: start, $lte: end }
    };
    
    // Get all the report data
    const [foodTemps, probeCalibrations, deliveries, tempRecords, coolingTemps, weeklyRecords] = await Promise.all([
      FoodTemperature.find(dateFilter).populate('location', 'name').populate('createdBy', 'username').sort({ createdAt: -1 }),
      ProbeCalibration.find(dateFilter).populate('location', 'name').populate('createdBy', 'username').sort({ createdAt: -1 }),
      Delivery.find(dateFilter).populate('location', 'name').populate('createdBy', 'username').sort({ createdAt: -1 }),
      TemperatureRecord.find(dateFilter).populate('location', 'name').populate('createdBy', 'username').sort({ createdAt: -1 }),
      CoolingTemperature.find(dateFilter).populate('location', 'name').populate('createdBy', 'username').sort({ createdAt: -1 }),
      WeeklyRecord.find(dateFilter).populate('location', 'name').populate('createdBy', 'username').sort({ createdAt: -1 })
    ]);
    
    // Analyze compliance
    const complianceAnalysis = {
      foodTemperature: analyzeTemperatureCompliance(foodTemps, 'food'),
      equipmentTemperature: analyzeTemperatureCompliance(tempRecords, 'equipment'),
      deliveryTemperature: analyzeTemperatureCompliance(deliveries, 'delivery'),
      coolingTemperature: analyzeCoolingCompliance(coolingTemps),
      probeCalibration: analyzeProbeCompliance(probeCalibrations),
      weeklyChecklists: analyzeWeeklyCompliance(weeklyRecords)
    };
    
    const totalRecords = foodTemps.length + tempRecords.length + deliveries.length + 
                        coolingTemps.length + probeCalibrations.length + weeklyRecords.length;
    
    const totalCompliant = Object.values(complianceAnalysis).reduce((sum, analysis) => 
      sum + analysis.compliant, 0);
    
    const overallComplianceRate = totalRecords > 0 ? 
      ((totalCompliant / totalRecords) * 100).toFixed(2) : 100;
    
    const violations = generateViolationsSummary(complianceAnalysis);
    
    // Generate HTML for PDF
    const html = generatePDFHTML({
      reportMetadata: {
        generatedAt: new Date().toISOString(),
        reportPeriod: { startDate: start.toISOString(), endDate: end.toISOString() },
        locations: allowedLocations.map(loc => ({ id: loc._id, name: loc.name })),
        generatedBy: { username: fullUser.username, role: fullUser.role }
      },
      executiveSummary: {
        totalRecords,
        overallComplianceRate: parseFloat(overallComplianceRate),
        totalViolations: violations.length,
        criticalViolations: violations.filter(v => v.severity === 'critical').length
      },
      complianceAnalysis,
      violations
    });
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename=compliance-report-${startDate}-to-${endDate}.html`);
    
    res.send(html);
    
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ message: 'Error generating report file' });
  }
});

// Generate HTML for PDF/Print
function generatePDFHTML(reportData) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Compliance Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: flex; justify-content: space-around; margin: 20px 0; }
        .summary-item { text-align: center; }
        .summary-value { font-size: 24px; font-weight: bold; }
        .section { margin: 20px 0; }
        .section h2 { color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        .violation { margin: 10px 0; padding: 10px; border-left: 4px solid #f44336; background-color: #fef7f7; }
        .critical { border-left-color: #d32f2f; }
        .major { border-left-color: #f57c00; }
        .minor { border-left-color: #1976d2; }
        @media print { 
          .section { page-break-inside: avoid; }
          .violation { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Food Safety Compliance Report</h1>
        <p><strong>Period:</strong> ${formatDate(reportData.reportMetadata.reportPeriod.startDate)} - ${formatDate(reportData.reportMetadata.reportPeriod.endDate)}</p>
        <p><strong>Location(s):</strong> ${reportData.reportMetadata.locations.map(l => l.name).join(', ')}</p>
        <p><strong>Generated by:</strong> ${reportData.reportMetadata.generatedBy.username} (${reportData.reportMetadata.generatedBy.role})</p>
        <p><strong>Generated:</strong> ${formatDate(reportData.reportMetadata.generatedAt)}</p>
      </div>
      
      <div class="section">
        <h2>Executive Summary</h2>
        <div class="summary">
          <div class="summary-item">
            <div class="summary-value">${reportData.executiveSummary.totalRecords}</div>
            <div>Total Records</div>
          </div>
          <div class="summary-item">
            <div class="summary-value" style="color: #4caf50;">${reportData.executiveSummary.overallComplianceRate}%</div>
            <div>Compliance Rate</div>
          </div>
          <div class="summary-item">
            <div class="summary-value" style="color: #f44336;">${reportData.executiveSummary.totalViolations}</div>
            <div>Total Violations</div>
          </div>
          <div class="summary-item">
            <div class="summary-value" style="color: #d32f2f;">${reportData.executiveSummary.criticalViolations}</div>
            <div>Critical Violations</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>Compliance Analysis by Category</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Total Records</th>
              <th>Compliant</th>
              <th>Violations</th>
              <th>Compliance Rate</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(reportData.complianceAnalysis).map(([category, analysis]) => `
              <tr>
                <td>${category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                <td>${analysis.total}</td>
                <td>${analysis.compliant}</td>
                <td>${analysis.violations.length}</td>
                <td style="color: ${parseFloat(analysis.complianceRate) >= 95 ? '#4caf50' : parseFloat(analysis.complianceRate) >= 85 ? '#ff9800' : '#f44336'}">${analysis.complianceRate}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      ${reportData.violations.length > 0 ? `
        <div class="section">
          <h2>Violations Summary</h2>
          ${reportData.violations.map(violation => `
            <div class="violation ${violation.severity}">
              <h4>${violation.category.toUpperCase()} - ${violation.location}</h4>
              <p><strong>Severity:</strong> ${violation.severity.toUpperCase()}</p>
              <p><strong>Date:</strong> ${formatDate(violation.recordedAt)}</p>
              <p><strong>Recorded by:</strong> ${violation.recordedBy}</p>
              ${violation.temperature ? `<p><strong>Temperature:</strong> ${violation.temperature}°C (Expected: ${violation.expectedRange})</p>` : ''}
              ${violation.deviation ? `<p><strong>Calibration Deviation:</strong> ${violation.deviation}°C</p>` : ''}
              ${violation.failedItems ? `<p><strong>Failed Items:</strong> ${violation.failedItems.join(', ')}</p>` : ''}
              ${violation.notes ? `<p><strong>Notes:</strong> ${violation.notes}</p>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <div class="section">
        <p style="text-align: center; color: #666; margin-top: 50px;">
          This report was generated by the Food Safety Management System<br>
          For questions about this report, contact your system administrator
        </p>
      </div>
    </body>
    </html>
  `;
}

// Helper functions for compliance analysis
function analyzeTemperatureCompliance(records, type) {
  const analysis = {
    total: records.length,
    compliant: 0,
    violations: []
  };
  
  records.forEach(record => {
    let isCompliant = false;
    let expectedRange = '';
    
    switch (type) {
      case 'food':
        // Hot food ≥63°C or cold food ≤10°C
        isCompliant = record.temperature >= 63 || record.temperature <= 10;
        expectedRange = '≤10°C (cold) or ≥63°C (hot)';
        break;
      case 'equipment':
      case 'delivery':
        // Should be ≤5°C
        isCompliant = record.temperature <= 5;
        expectedRange = '≤5°C';
        break;
    }
    
    if (isCompliant) {
      analysis.compliant++;
    } else {
      analysis.violations.push({
        id: record._id,
        temperature: record.temperature,
        expectedRange,
        location: record.location?.name || 'Unknown',
        recordedBy: record.createdBy?.username || 'Unknown',
        recordedAt: record.createdAt,
        severity: getSeverityLevel(record.temperature, type),
        notes: record.notes || ''
      });
    }
  });
  
  analysis.complianceRate = analysis.total > 0 ? 
    ((analysis.compliant / analysis.total) * 100).toFixed(2) : 100;
  
  return analysis;
}

function analyzeCoolingCompliance(records) {
  const analysis = {
    total: records.length,
    compliant: 0,
    violations: []
  };
  
  records.forEach(record => {
    const isCompliant = record.temperatureAfter2Hours <= 8;
    
    if (isCompliant) {
      analysis.compliant++;
    } else {
      analysis.violations.push({
        id: record._id,
        temperature: record.temperatureAfter2Hours,
        expectedRange: '≤8°C after 2 hours',
        location: record.location?.name || 'Unknown',
        recordedBy: record.createdBy?.username || 'Unknown',
        recordedAt: record.createdAt,
        severity: record.temperatureAfter2Hours > 15 ? 'critical' : 'major',
        notes: record.notes || ''
      });
    }
  });
  
  analysis.complianceRate = analysis.total > 0 ? 
    ((analysis.compliant / analysis.total) * 100).toFixed(2) : 100;
  
  return analysis;
}

function analyzeProbeCompliance(records) {
  const analysis = {
    total: records.length,
    compliant: 0,
    violations: []
  };
  
  records.forEach(record => {
    // Probe calibration should be within ±1°C tolerance
    const tolerance = 1.0;
    const isCompliant = Math.abs(record.actualTemperature - record.expectedTemperature) <= tolerance;
    
    if (isCompliant) {
      analysis.compliant++;
    } else {
      const deviation = Math.abs(record.actualTemperature - record.expectedTemperature);
      analysis.violations.push({
        id: record._id,
        actualTemperature: record.actualTemperature,
        expectedTemperature: record.expectedTemperature,
        deviation: deviation.toFixed(2),
        tolerance: `±${tolerance}°C`,
        location: record.location?.name || 'Unknown',
        recordedBy: record.createdBy?.username || 'Unknown',
        recordedAt: record.createdAt,
        severity: deviation > 2 ? 'critical' : 'major',
        notes: record.notes || ''
      });
    }
  });
  
  analysis.complianceRate = analysis.total > 0 ? 
    ((analysis.compliant / analysis.total) * 100).toFixed(2) : 100;
  
  return analysis;
}

function analyzeWeeklyCompliance(records) {
  const analysis = {
    total: records.length,
    compliant: 0,
    violations: []
  };
  
  records.forEach(record => {
    const checklist = record.checklistData || {};
    const failedItems = [];
    
    // Check each checklist item
    Object.entries(checklist).forEach(([key, value]) => {
      if (typeof value === 'object' && value.value === 'No') {
        failedItems.push(key);
      }
    });
    
    if (failedItems.length === 0) {
      analysis.compliant++;
    } else {
      analysis.violations.push({
        id: record._id,
        failedItems,
        totalItems: Object.keys(checklist).length,
        location: record.location?.name || 'Unknown',
        recordedBy: record.createdBy?.username || 'Unknown',
        recordedAt: record.createdAt,
        severity: failedItems.length > 3 ? 'critical' : 'major',
        notes: record.notes || ''
      });
    }
  });
  
  analysis.complianceRate = analysis.total > 0 ? 
    ((analysis.compliant / analysis.total) * 100).toFixed(2) : 100;
  
  return analysis;
}

function getSeverityLevel(temperature, type) {
  switch (type) {
    case 'food':
      if (temperature > 10 && temperature < 40) return 'critical';
      if (temperature > 10 && temperature < 63) return 'major';
      return 'minor';
    case 'equipment':
    case 'delivery':
      if (temperature > 10) return 'critical';
      if (temperature > 5) return 'major';
      return 'minor';
    default:
      return 'minor';
  }
}

function generateViolationsSummary(complianceAnalysis) {
  const violations = [];
  
  Object.entries(complianceAnalysis).forEach(([category, analysis]) => {
    if (analysis.violations) {
      analysis.violations.forEach(violation => {
        violations.push({
          ...violation,
          category: category.replace(/([A-Z])/g, ' $1').toLowerCase().trim()
        });
      });
    }
  });
  
  // Sort by severity and date
  violations.sort((a, b) => {
    const severityOrder = { critical: 3, major: 2, minor: 1 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[b.severity] - severityOrder[a.severity];
    }
    return new Date(b.recordedAt) - new Date(a.recordedAt);
  });
  
  return violations;
}

async function generateCorrectiveActions(violations, startDate, endDate) {
  // In a real system, this would track actual corrective actions taken
  // For now, generate suggested actions based on violations
  const actions = [];
  
  const criticalViolations = violations.filter(v => v.severity === 'critical');
  
  if (criticalViolations.length > 0) {
    actions.push({
      type: 'immediate',
      description: 'Critical temperature violations require immediate attention',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      assignedTo: 'Site Manager',
      status: 'pending'
    });
  }
  
  return actions;
}

function generateRecommendations(complianceAnalysis, violations) {
  const recommendations = [];
  
  // Temperature-based recommendations
  const tempViolations = violations.filter(v => 
    v.category.includes('temperature') && v.severity === 'critical'
  );
  
  if (tempViolations.length > 5) {
    recommendations.push({
      priority: 'high',
      category: 'equipment',
      description: 'High number of temperature violations suggests equipment malfunction or training issues',
      action: 'Review equipment maintenance schedules and provide additional staff training'
    });
  }
  
  // Weekly checklist recommendations
  const checklistCompliance = parseFloat(complianceAnalysis.weeklyChecklists.complianceRate);
  if (checklistCompliance < 90) {
    recommendations.push({
      priority: 'medium',
      category: 'procedures',
      description: 'Weekly checklist compliance below 90%',
      action: 'Review checklist procedures with staff and ensure adequate time allocation'
    });
  }
  
  return recommendations;
}

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

// Check for probe calibrations that are due (monthly schedule)
async function checkProbeCalibrationsDue(locations) {
  const alerts = [];
  const CALIBRATION_INTERVAL_DAYS = 30; // Monthly calibration required
  const WARNING_DAYS = 7; // Warn 7 days before due
  
  try {
    for (const location of locations) {
      // Get all unique probe IDs for this location
      const probesWithCalibrations = await ProbeCalibration.aggregate([
        { $match: { location: location._id } },
        { 
          $group: {
            _id: "$probeId",
            lastCalibration: { $max: "$createdAt" },
            location: { $first: "$location" }
          }
        }
      ]);

      // Check each probe's calibration status
      for (const probe of probesWithCalibrations) {
        const daysSinceCalibration = Math.floor(
          (new Date() - new Date(probe.lastCalibration)) / (1000 * 60 * 60 * 24)
        );
        
        const daysUntilDue = CALIBRATION_INTERVAL_DAYS - daysSinceCalibration;
        
        // Create alert if calibration is due or overdue
        if (daysUntilDue <= WARNING_DAYS) {
          let severity, message, time;
          
          if (daysUntilDue <= 0) {
            // Overdue
            const daysOverdue = Math.abs(daysUntilDue);
            severity = daysOverdue > 7 ? 'high' : 'medium';
            message = `Probe ${probe._id} calibration overdue`;
            time = daysOverdue === 0 ? 'Due today' : `${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`;
          } else {
            // Due soon
            severity = 'low';
            message = `Probe ${probe._id} calibration due soon`;
            time = daysUntilDue === 1 ? 'Due tomorrow' : `Due in ${daysUntilDue} days`;
          }
          
          alerts.push({
            id: `probe-cal-${probe._id}-${location._id}`,
            type: 'Equipment',
            message,
            location: location.name,
            severity,
            time,
            metadata: {
              probeId: probe._id,
              lastCalibration: probe.lastCalibration,
              daysSinceCalibration,
              daysUntilDue
            }
          });
        }
      }

      // Check for locations that have no probe calibrations at all
      const totalProbeRecords = await ProbeCalibration.countDocuments({ location: location._id });
      if (totalProbeRecords === 0) {
        alerts.push({
          id: `no-probe-cal-${location._id}`,
          type: 'Equipment',
          message: 'No probe calibrations recorded',
          location: location.name,
          severity: 'medium',
          time: 'Action required',
          metadata: {
            reason: 'no_calibrations'
          }
        });
      }
    }
  } catch (error) {
    console.error('Error checking probe calibrations:', error);
  }

  return alerts;
}

// Get detailed probe calibration status for locations
async function getProbeCalibrationStatus(locations) {
  const CALIBRATION_INTERVAL_DAYS = 30; // Monthly calibration required
  const WARNING_DAYS = 7; // Warn 7 days before due
  const statusByLocation = [];

  try {
    for (const location of locations) {
      // Get all unique probe IDs for this location with their last calibration
      const probesWithCalibrations = await ProbeCalibration.aggregate([
        { $match: { location: location._id } },
        { 
          $group: {
            _id: "$probeId",
            lastCalibration: { $max: "$createdAt" },
            calibrationCount: { $sum: 1 },
            location: { $first: "$location" }
          }
        },
        { $sort: { lastCalibration: -1 } }
      ]);

      const probeStatuses = [];
      let overdue = 0;
      let dueSoon = 0;
      let upToDate = 0;

      for (const probe of probesWithCalibrations) {
        const daysSinceCalibration = Math.floor(
          (new Date() - new Date(probe.lastCalibration)) / (1000 * 60 * 60 * 24)
        );
        
        const daysUntilDue = CALIBRATION_INTERVAL_DAYS - daysSinceCalibration;
        
        let status, nextDueDate, priority;
        
        if (daysUntilDue <= 0) {
          status = 'overdue';
          priority = 'high';
          overdue++;
        } else if (daysUntilDue <= WARNING_DAYS) {
          status = 'due_soon';
          priority = 'medium';
          dueSoon++;
        } else {
          status = 'up_to_date';
          priority = 'low';
          upToDate++;
        }

        // Calculate next due date
        const nextDue = new Date(probe.lastCalibration);
        nextDue.setDate(nextDue.getDate() + CALIBRATION_INTERVAL_DAYS);

        probeStatuses.push({
          probeId: probe._id,
          lastCalibration: probe.lastCalibration,
          nextDueDate: nextDue,
          daysSinceCalibration,
          daysUntilDue,
          status,
          priority,
          calibrationCount: probe.calibrationCount
        });
      }

      statusByLocation.push({
        locationId: location._id,
        locationName: location.name,
        probes: probeStatuses,
        summary: {
          total: probeStatuses.length,
          overdue,
          dueSoon,
          upToDate
        }
      });
    }
  } catch (error) {
    console.error('Error getting probe calibration status:', error);
  }

  return statusByLocation;
}

// Check for daily temperature readings (weekdays only)
async function checkDailyTemperatureReadings(locations) {
  const alerts = [];
  
  try {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Only check on weekdays (Monday to Friday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return alerts; // No alerts on weekends
    }
    
    // Get start of today
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    // Get start of yesterday (for checking if yesterday's readings were missed)
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    
    // Skip yesterday check if it was weekend
    const yesterdayDayOfWeek = yesterdayStart.getDay();
    const checkYesterday = yesterdayDayOfWeek !== 0 && yesterdayDayOfWeek !== 6;
    
    for (const location of locations) {
      // Get all equipment for this location
      const Equipment = require('../models/Equipment');
      const equipment = await Equipment.find({ location: location._id });
      
      if (equipment.length === 0) {
        continue; // Skip locations with no equipment
      }
      
      // Check today's temperature readings
      const todayReadings = await TemperatureRecord.find({
        location: location._id,
        createdAt: { $gte: todayStart }
      }).populate('equipment', 'name type');
      
      // Group readings by equipment type
      const todayFridgeReadings = todayReadings.filter(r => 
        r.equipmentType === 'fridge' || (r.equipment && r.equipment.type === 'fridge')
      );
      const todayFreezerReadings = todayReadings.filter(r => 
        r.equipmentType === 'freezer' || (r.equipment && r.equipment.type === 'freezer')
      );
      
      // Count equipment by type
      const fridges = equipment.filter(e => e.type === 'fridge');
      const freezers = equipment.filter(e => e.type === 'freezer');
      
      // Check if daily readings are missing for today
      if (fridges.length > 0 && todayFridgeReadings.length === 0) {
        alerts.push({
          id: `fridge-temp-today-${location._id}`,
          type: 'Equipment',
          message: 'Daily fridge temperature check required',
          location: location.name,
          severity: 'medium',
          time: 'Due today',
          metadata: {
            equipmentType: 'fridge',
            equipmentCount: fridges.length,
            readingsToday: 0,
            reminderType: 'daily_check'
          }
        });
      }
      
      if (freezers.length > 0 && todayFreezerReadings.length === 0) {
        alerts.push({
          id: `freezer-temp-today-${location._id}`,
          type: 'Equipment',
          message: 'Daily freezer temperature check required',
          location: location.name,
          severity: 'medium',
          time: 'Due today',
          metadata: {
            equipmentType: 'freezer',
            equipmentCount: freezers.length,
            readingsToday: 0,
            reminderType: 'daily_check'
          }
        });
      }
      
      // Check yesterday's readings if it was a weekday
      if (checkYesterday) {
        const yesterdayEnd = new Date(todayStart);
        yesterdayEnd.setMilliseconds(-1); // End of yesterday
        
        const yesterdayReadings = await TemperatureRecord.find({
          location: location._id,
          createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd }
        }).populate('equipment', 'name type');
        
        const yesterdayFridgeReadings = yesterdayReadings.filter(r => 
          r.equipmentType === 'fridge' || (r.equipment && r.equipment.type === 'fridge')
        );
        const yesterdayFreezerReadings = yesterdayReadings.filter(r => 
          r.equipmentType === 'freezer' || (r.equipment && r.equipment.type === 'freezer')
        );
        
        // Alert for missed yesterday readings
        if (fridges.length > 0 && yesterdayFridgeReadings.length === 0) {
          alerts.push({
            id: `fridge-temp-missed-${location._id}`,
            type: 'Equipment',
            message: 'Missed fridge temperature check yesterday',
            location: location.name,
            severity: 'high',
            time: 'Overdue',
            metadata: {
              equipmentType: 'fridge',
              equipmentCount: fridges.length,
              readingsYesterday: 0,
              reminderType: 'missed_daily_check'
            }
          });
        }
        
        if (freezers.length > 0 && yesterdayFreezerReadings.length === 0) {
          alerts.push({
            id: `freezer-temp-missed-${location._id}`,
            type: 'Equipment',
            message: 'Missed freezer temperature check yesterday',
            location: location.name,
            severity: 'high',
            time: 'Overdue',
            metadata: {
              equipmentType: 'freezer',
              equipmentCount: freezers.length,
              readingsYesterday: 0,
              reminderType: 'missed_daily_check'
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking daily temperature readings:', error);
  }
  
  return alerts;
}

// Get detailed temperature reading status for locations
async function getTemperatureReadingStatus(locations) {
  const statusByLocation = [];
  
  try {
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    // Get start of today
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    // Get start of yesterday
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayStart);
    yesterdayEnd.setMilliseconds(-1);
    
    // Check if yesterday was a weekday
    const yesterdayDayOfWeek = yesterdayStart.getDay();
    const isYesterdayWeekday = yesterdayDayOfWeek !== 0 && yesterdayDayOfWeek !== 6;
    
    for (const location of locations) {
      // Get all equipment for this location
      const Equipment = require('../models/Equipment');
      const equipment = await Equipment.find({ location: location._id });
      
      const fridges = equipment.filter(e => e.type === 'fridge');
      const freezers = equipment.filter(e => e.type === 'freezer');
      
      // Get today's readings
      const todayReadings = await TemperatureRecord.find({
        location: location._id,
        createdAt: { $gte: todayStart }
      }).populate('equipment', 'name type');
      
      // Get yesterday's readings (if it was a weekday)
      let yesterdayReadings = [];
      if (isYesterdayWeekday) {
        yesterdayReadings = await TemperatureRecord.find({
          location: location._id,
          createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd }
        }).populate('equipment', 'name type');
      }
      
      // Analyze readings by equipment type
      const todayFridgeReadings = todayReadings.filter(r => 
        r.equipmentType === 'fridge' || (r.equipment && r.equipment.type === 'fridge')
      );
      const todayFreezerReadings = todayReadings.filter(r => 
        r.equipmentType === 'freezer' || (r.equipment && r.equipment.type === 'freezer')
      );
      
      const yesterdayFridgeReadings = yesterdayReadings.filter(r => 
        r.equipmentType === 'fridge' || (r.equipment && r.equipment.type === 'fridge')
      );
      const yesterdayFreezerReadings = yesterdayReadings.filter(r => 
        r.equipmentType === 'freezer' || (r.equipment && r.equipment.type === 'freezer')
      );
      
      statusByLocation.push({
        locationId: location._id,
        locationName: location.name,
        isWeekday: dayOfWeek !== 0 && dayOfWeek !== 6,
        equipment: {
          fridges: fridges.length,
          freezers: freezers.length
        },
        readings: {
          today: {
            fridge: todayFridgeReadings.length,
            freezer: todayFreezerReadings.length
          },
          yesterday: {
            fridge: yesterdayFridgeReadings.length,
            freezer: yesterdayFreezerReadings.length,
            wasWeekday: isYesterdayWeekday
          }
        },
        compliance: {
          fridgeReadingToday: fridges.length === 0 || todayFridgeReadings.length > 0,
          freezerReadingToday: freezers.length === 0 || todayFreezerReadings.length > 0,
          fridgeReadingYesterday: !isYesterdayWeekday || fridges.length === 0 || yesterdayFridgeReadings.length > 0,
          freezerReadingYesterday: !isYesterdayWeekday || freezers.length === 0 || yesterdayFreezerReadings.length > 0
        },
        lastReadings: {
          fridge: todayFridgeReadings.length > 0 ? todayFridgeReadings[0].createdAt : 
                 (yesterdayFridgeReadings.length > 0 ? yesterdayFridgeReadings[0].createdAt : null),
          freezer: todayFreezerReadings.length > 0 ? todayFreezerReadings[0].createdAt : 
                  (yesterdayFreezerReadings.length > 0 ? yesterdayFreezerReadings[0].createdAt : null)
        }
      });
    }
  } catch (error) {
    console.error('Error getting temperature reading status:', error);
  }
  
  return statusByLocation;
}

module.exports = router; 