const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['food_temperature', 'probe_calibration', 'delivery', 'fridge_temperature', 'freezer_temperature'],
        required: true
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    equipment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipment'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Food Temperature Record
const foodTemperatureSchema = new mongoose.Schema({
    foodName: {
        type: String,
        required: true
    },
    temperature: {
        type: Number,
        required: true
    }
});

// Probe Calibration Record
const probeCalibrationSchema = new mongoose.Schema({
    probeId: {
        type: String,
        required: true
    },
    temperature: {
        type: Number,
        required: true
    },
    isCalibrated: {
        type: Boolean,
        required: true
    }
});

// Delivery Record
const deliverySchema = new mongoose.Schema({
    supplier: {
        type: String,
        required: true
    },
    temperature: {
        type: Number,
        required: true
    },
    notes: String
});

// Fridge/Freezer Temperature Record
const temperatureRecordSchema = new mongoose.Schema({
    equipment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipment',
        required: true
    },
    temperature: {
        type: Number,
        required: true
    },
    equipmentType: {
        type: String,
        enum: ['fridge', 'freezer'],
        required: true
    },
    note: {
        type: String,
        trim: true
    }
});

// Create models
const FoodTemperature = mongoose.model('FoodTemperature', { ...recordSchema.obj, ...foodTemperatureSchema.obj });
const ProbeCalibration = mongoose.model('ProbeCalibration', { ...recordSchema.obj, ...probeCalibrationSchema.obj });
const Delivery = mongoose.model('Delivery', { ...recordSchema.obj, ...deliverySchema.obj });
const TemperatureRecord = mongoose.model('TemperatureRecord', { ...recordSchema.obj, ...temperatureRecordSchema.obj });

module.exports = {
    FoodTemperature,
    ProbeCalibration,
    Delivery,
    TemperatureRecord
}; 