require('dotenv').config();
const mongoose = require('mongoose');
const {
    FoodTemperature,
    ProbeCalibration,
    Delivery,
    TemperatureRecord
} = require('./models/Record');

const checkRecords = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food-safety');
        console.log('Connected to MongoDB');

        const userId = '681ca3edd234e7ecce2c4645';
        const locationId = '681ca3d9d234e7ecce2c4638';

        console.log('\nChecking records for:');
        console.log('User ID:', userId);
        console.log('Location ID:', locationId);

        // Check Food Temperature Records
        const foodTemps = await FoodTemperature.find({
            location: locationId,
            createdBy: userId
        });
        console.log('\nFood Temperature Records:', foodTemps.length);
        console.log(foodTemps);

        // Check Probe Calibration Records
        const probeCals = await ProbeCalibration.find({
            location: locationId,
            createdBy: userId
        });
        console.log('\nProbe Calibration Records:', probeCals.length);
        console.log(probeCals);

        // Check Delivery Records
        const deliveries = await Delivery.find({
            location: locationId,
            createdBy: userId
        });
        console.log('\nDelivery Records:', deliveries.length);
        console.log(deliveries);

        // Check Temperature Records
        const temps = await TemperatureRecord.find({
            location: locationId,
            createdBy: userId
        });
        console.log('\nTemperature Records:', temps.length);
        console.log(temps);

        // Check all records for the location (regardless of user)
        const allFoodTemps = await FoodTemperature.find({ location: locationId });
        const allProbeCals = await ProbeCalibration.find({ location: locationId });
        const allDeliveries = await Delivery.find({ location: locationId });
        const allTemps = await TemperatureRecord.find({ location: locationId });

        console.log('\nAll records for location:');
        console.log('Food Temperature Records:', allFoodTemps.length);
        console.log('Probe Calibration Records:', allProbeCals.length);
        console.log('Delivery Records:', allDeliveries.length);
        console.log('Temperature Records:', allTemps.length);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

checkRecords(); 