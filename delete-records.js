const mongoose = require('mongoose');
const { FoodTemperature, ProbeCalibration, Delivery, TemperatureRecord } = require('./models/Record');

mongoose.connect('mongodb://localhost:27017/food-safety')
  .then(async () => {
    try {
      const locationId = '681ca3d9d234e7ecce2c4638'; // Your location ID
      
      console.log('Deleting records for location:', locationId, 'from database food-safety');
      
      // Delete all records for this location
      const foodTempResult = await FoodTemperature.deleteMany({ location: locationId });
      console.log('Deleted food temperature records:', foodTempResult.deletedCount);
      
      const probeCalResult = await ProbeCalibration.deleteMany({ location: locationId });
      console.log('Deleted probe calibration records:', probeCalResult.deletedCount);
      
      const deliveryResult = await Delivery.deleteMany({ location: locationId });
      console.log('Deleted delivery records:', deliveryResult.deletedCount);
      
      const tempResult = await TemperatureRecord.deleteMany({ location: locationId });
      console.log('Deleted temperature records:', tempResult.deletedCount);
      
      // Verify deletion
      const remainingFoodTemps = await FoodTemperature.countDocuments({ location: locationId });
      const remainingProbeCals = await ProbeCalibration.countDocuments({ location: locationId });
      const remainingDeliveries = await Delivery.countDocuments({ location: locationId });
      const remainingTemps = await TemperatureRecord.countDocuments({ location: locationId });
      
      console.log('\nVerification in food-safety database:');
      console.log('Remaining food temperature records:', remainingFoodTemps);
      console.log('Remaining probe calibration records:', remainingProbeCals);
      console.log('Remaining delivery records:', remainingDeliveries);
      console.log('Remaining temperature records:', remainingTemps);
      
      // Check if any records exist at all in the correct database
      const allFoodTemps = await FoodTemperature.countDocuments();
      const allProbeCals = await ProbeCalibration.countDocuments();
      const allDeliveries = await Delivery.countDocuments();
      const allTemps = await TemperatureRecord.countDocuments();
      
      console.log('\nTotal records in food-safety database:');
      console.log('Total food temperature records:', allFoodTemps);
      console.log('Total probe calibration records:', allProbeCals);
      console.log('Total delivery records:', allDeliveries);
      console.log('Total temperature records:', allTemps);
      
    } catch (err) {
      console.error('Error deleting records:', err);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB food-safety:', err);
  }); 