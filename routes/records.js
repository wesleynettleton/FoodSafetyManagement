const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Location = require('../models/Location');
const Equipment = require('../models/Equipment');
const {
    FoodTemperature,
    ProbeCalibration,
    Delivery,
    TemperatureRecord,
    CoolingTemperature
} = require('../models/Record');

// @route   POST api/records/food-temperature
// @desc    Create a food temperature record
// @access  Private
router.post('/food-temperature', [
    auth,
    check('foodName', 'Food name is required').not().isEmpty(),
    check('temperature', 'Temperature is required').isNumeric()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id);
        const record = new FoodTemperature({
            type: 'food_temperature',
            foodName: req.body.foodName,
            temperature: req.body.temperature,
            location: user.siteLocation,
            createdBy: user.id
        });

        await record.save();
        res.json(record);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/records/probe-calibration
// @desc    Create a probe calibration record
// @access  Private
router.post('/probe-calibration', [
    auth,
    check('probeId', 'Probe ID is required').not().isEmpty(),
    check('temperature', 'Temperature is required').isNumeric(),
    check('isCalibrated', 'Calibration status is required').isBoolean()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id);
        const record = new ProbeCalibration({
            type: 'probe_calibration',
            probeId: req.body.probeId,
            temperature: req.body.temperature,
            isCalibrated: req.body.isCalibrated,
            location: user.siteLocation,
            createdBy: user.id
        });

        await record.save();
        res.json(record);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/records/delivery
// @desc    Create a delivery record
// @access  Private
router.post('/delivery', [
    auth,
    check('supplier', 'Supplier is required').not().isEmpty(),
    check('temperature', 'Temperature is required').isNumeric()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id);
        const record = new Delivery({
            type: 'delivery',
            supplier: req.body.supplier,
            temperature: req.body.temperature,
            notes: req.body.notes,
            location: user.siteLocation,
            createdBy: user.id
        });

        await record.save();
        res.json(record);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/records/temperature
// @desc    Create a fridge/freezer temperature record
// @access  Private
router.post('/temperature', [
    auth,
    check('equipmentId', 'Equipment ID is required').not().isEmpty(),
    check('temperature', 'Temperature is required').isNumeric(),
    check('equipmentType', 'Equipment type is required').isIn(['fridge', 'freezer']),
    check('note', 'Note must be a string').optional().isString().trim()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { equipmentId, temperature, equipmentType, note } = req.body;

    try {
        const user = await User.findById(req.user.id);
        console.log('Creating temperature record:', {
            equipment: equipmentId,
            temperature: temperature,
            equipmentType: equipmentType,
            note: note,
            location: user.siteLocation
        });
        
        const equipment = await Equipment.findOne({
            _id: equipmentId,
            location: user.siteLocation,
            type: equipmentType
        });

        if (!equipment) {
            console.error('Equipment not found:', {
                id: equipmentId,
                type: equipmentType,
                location: user.siteLocation
            });
            return res.status(400).json({ 
                msg: 'Equipment not found or does not match the specified type for this location' 
            });
        }

        const record = new TemperatureRecord({
            type: equipmentType === 'freezer' ? 'freezer_temperature' : 'fridge_temperature',
            equipment: equipment._id,
            temperature: temperature,
            equipmentType: equipmentType,
            note: note,
            location: user.siteLocation,
            createdBy: user.id
        });

        await record.save();
        await record.populate('equipment', 'name type');
        res.json(record);
    } catch (err) {
        console.error('Error creating temperature record:', err);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/records/cooling-temperature
// @desc    Create a cooling temperature record
// @access  Private
router.post('/cooling-temperature', [
    auth,
    check('foodName', 'Food name is required').not().isEmpty(),
    check('coolingStartTime', 'Cooling start time is required').isISO8601(),
    check('movedToStorageTime', 'Time moved to storage is required').isISO8601(),
    check('temperatureAfter90Min', 'Temperature after 90 minutes is required').isNumeric(),
    check('temperatureAfter2Hours', 'Temperature after 2 hours is required').isNumeric()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id);
        const record = new CoolingTemperature({
            type: 'cooling_temperature',
            foodName: req.body.foodName,
            coolingStartTime: new Date(req.body.coolingStartTime),
            movedToStorageTime: new Date(req.body.movedToStorageTime),
            temperatureAfter90Min: req.body.temperatureAfter90Min,
            temperatureAfter2Hours: req.body.temperatureAfter2Hours,
            correctiveActions: req.body.correctiveActions,
            location: user.siteLocation,
            createdBy: user.id
        });

        await record.save();
        res.json(record);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/records/:type
// @desc    Get records by type for a location
// @access  Private
router.get('/:type', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        let records;
        let Model;

        switch (req.params.type) {
            case 'food-temperature':
                Model = FoodTemperature;
                break;
            case 'probe-calibration':
                Model = ProbeCalibration;
                break;
            case 'delivery':
                Model = Delivery;
                break;
            case 'cooling-temperature':
                Model = CoolingTemperature;
                break;
            case 'temperature':
            case 'fridge_temperature':
            case 'freezer_temperature':
                Model = TemperatureRecord;
                break;
            default:
                return res.status(400).json({ msg: 'Invalid record type' });
        }

        // First, migrate any records that still use equipmentId
        const recordsToMigrate = await Model.find({ 
            location: user.siteLocation,
            equipmentId: { $exists: true }
        });

        for (const record of recordsToMigrate) {
            const equipment = await Equipment.findById(record.equipmentId);
            if (equipment) {
                await Model.findByIdAndUpdate(record._id, {
                    equipment: equipment._id,
                    $unset: { equipmentId: "" }
                });
            }
        }

        // Now fetch the records with proper population
        const query = Model.find({ location: user.siteLocation })
            .populate('createdBy', 'name');

        // Always populate equipment for temperature records
        if (Model === TemperatureRecord) {
            query.populate({
                path: 'equipment',
                select: 'name type',
                model: 'Equipment'
            });
        }

        records = await query.sort({ createdAt: -1 });

        // For any records that still have equipmentId, populate them manually
        records = records.map(record => {
            if (record.equipmentId && !record.equipment) {
                return {
                    ...record.toObject(),
                    equipment: {
                        _id: record.equipmentId,
                        name: record.equipmentId === '681de6aac9385a5ff66452db' ? 'Fridge 1' :
                              record.equipmentId === '681de6b1c9385a5ff66452e1' ? 'Fridge 2' :
                              record.equipmentId === '681de6b9c9385a5ff66452e7' ? 'Walk in Fridge' :
                              record.equipmentId === '681de7f53b6b915d08855c4b' ? 'Main Fridge' :
                              record.equipmentId === '681de6c1c9385a5ff66452ed' ? 'Chest Freezer' : 'Unknown',
                        type: record.equipmentType
                    }
                };
            }
            return record;
        });

        res.json(records);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET api/records
// @desc    Get all records for the user's location (or all for admin, across locations - TBD)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        console.log('Fetching records for user:', {
            id: user.id,
            role: user.role,
            siteLocation: user.siteLocation
        });

        let allRecords = [];

        // For kitchen staff, only show their own records
        if (user.role === 'kitchen_staff') {
            console.log('Fetching records for kitchen staff user:', user.id);
            
            const foodTemps = await FoodTemperature.find({ 
                location: user.siteLocation,
                createdBy: user.id 
            }).populate('createdBy', 'name').sort({ createdAt: -1 });
            console.log('Food temperature records found:', foodTemps.length);
            
            const probeCals = await ProbeCalibration.find({ 
                location: user.siteLocation,
                createdBy: user.id 
            }).populate('createdBy', 'name').sort({ createdAt: -1 });
            console.log('Probe calibration records found:', probeCals.length);
            
            const deliveries = await Delivery.find({ 
                location: user.siteLocation,
                createdBy: user.id 
            }).populate('createdBy', 'name').sort({ createdAt: -1 });
            console.log('Delivery records found:', deliveries.length);

            const coolingTemps = await CoolingTemperature.find({ 
                location: user.siteLocation,
                createdBy: user.id 
            }).populate('createdBy', 'name').sort({ createdAt: -1 });
            console.log('Cooling temperature records found:', coolingTemps.length);
            
            // First, migrate any temperature records that still use equipmentId
            const tempsToMigrate = await TemperatureRecord.find({ 
                location: user.siteLocation,
                createdBy: user.id,
                equipmentId: { $exists: true }
            });

            for (const record of tempsToMigrate) {
                const equipment = await Equipment.findById(record.equipmentId);
                if (equipment) {
                    await TemperatureRecord.findByIdAndUpdate(record._id, {
                        equipment: equipment._id,
                        $unset: { equipmentId: "" }
                    });
                }
            }
            
            const temps = await TemperatureRecord.find({ 
                location: user.siteLocation,
                createdBy: user.id 
            }).populate('createdBy', 'name')
              .populate({
                  path: 'equipment',
                  select: 'name type',
                  model: 'Equipment'
              })
              .sort({ createdAt: -1 });
            console.log('Temperature records found:', temps.length);

            allRecords = [...foodTemps, ...probeCals, ...deliveries, ...coolingTemps, ...temps];
        } else {
            // For admin, show all records for their location
            console.log('Fetching all records for location:', user.siteLocation);
            
            const foodTemps = await FoodTemperature.find({ location: user.siteLocation })
                .populate('createdBy', 'name')
                .sort({ createdAt: -1 });
            console.log('Food temperature records found:', foodTemps.length);
            
            const probeCals = await ProbeCalibration.find({ location: user.siteLocation })
                .populate('createdBy', 'name')
                .sort({ createdAt: -1 });
            console.log('Probe calibration records found:', probeCals.length);
            
            const deliveries = await Delivery.find({ location: user.siteLocation })
                .populate('createdBy', 'name')
                .sort({ createdAt: -1 });
            console.log('Delivery records found:', deliveries.length);

            const coolingTemps = await CoolingTemperature.find({ location: user.siteLocation })
                .populate('createdBy', 'name')
                .sort({ createdAt: -1 });
            console.log('Cooling temperature records found:', coolingTemps.length);
            
            // First, migrate any temperature records that still use equipmentId
            const tempsToMigrate = await TemperatureRecord.find({ 
                location: user.siteLocation,
                equipmentId: { $exists: true }
            });

            for (const record of tempsToMigrate) {
                const equipment = await Equipment.findById(record.equipmentId);
                if (equipment) {
                    await TemperatureRecord.findByIdAndUpdate(record._id, {
                        equipment: equipment._id,
                        $unset: { equipmentId: "" }
                    });
                }
            }
            
            const temps = await TemperatureRecord.find({ location: user.siteLocation })
                .populate('createdBy', 'name')
                .populate({
                    path: 'equipment',
                    select: 'name type',
                    model: 'Equipment'
                })
                .sort({ createdAt: -1 });
            console.log('Temperature records found:', temps.length);

            allRecords = [...foodTemps, ...probeCals, ...deliveries, ...coolingTemps, ...temps];
        }

        // For any records that still have equipmentId, populate them manually
        allRecords = allRecords.map(record => {
            if (record.equipmentId && !record.equipment) {
                return {
                    ...record.toObject(),
                    equipment: {
                        _id: record.equipmentId,
                        name: record.equipmentId === '681de6aac9385a5ff66452db' ? 'Fridge 1' :
                              record.equipmentId === '681de6b1c9385a5ff66452e1' ? 'Fridge 2' :
                              record.equipmentId === '681de6b9c9385a5ff66452e7' ? 'Walk in Fridge' :
                              record.equipmentId === '681de7f53b6b915d08855c4b' ? 'Main Fridge' :
                              record.equipmentId === '681de6c1c9385a5ff66452ed' ? 'Chest Freezer' : 'Unknown',
                        type: record.equipmentType
                    }
                };
            }
            return record;
        });

        console.log('Found records:', {
            total: allRecords.length,
            foodTemps: allRecords.filter(r => r.type === 'food_temperature').length,
            probeCals: allRecords.filter(r => r.type === 'probe_calibration').length,
            deliveries: allRecords.filter(r => r.type === 'delivery').length,
            coolingTemps: allRecords.filter(r => r.type === 'cooling_temperature').length,
            temps: allRecords.filter(r => r.type === 'fridge_temperature' || r.type === 'freezer_temperature').length
        });

        // Log the first record if any exist
        if (allRecords.length > 0) {
            console.log('First record:', {
                type: allRecords[0].type,
                createdBy: allRecords[0].createdBy,
                location: allRecords[0].location,
                equipment: allRecords[0].equipment
            });
        }

        res.json(allRecords);
    } catch (err) {
        console.error('Error fetching records:', err);
        res.status(500).send('Server Error');
    }
});


// @route   GET api/records/admin/:type/:locationId
// @desc    Get records by type for a specific location (admin only)
// @access  Private
router.get('/admin/:type/:locationId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        let Model;
        switch (req.params.type) {
            case 'food-temperature':
                Model = FoodTemperature;
                break;
            case 'probe-calibration':
                Model = ProbeCalibration;
                break;
            case 'delivery':
                Model = Delivery;
                break;
            case 'temperature':
            case 'fridge_temperature':
            case 'freezer_temperature':
                Model = TemperatureRecord;
                break;
            default:
                return res.status(400).json({ msg: 'Invalid record type' });
        }
        const records = await Model.find({ location: req.params.locationId })
            .populate('createdBy', 'name')
            .populate('equipment', 'name type')
            .sort({ createdAt: -1 });
        res.json(records);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/records/all
// @desc    Delete all records for a location
// @access  Private
router.delete('/all', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Delete all records for the user's location
        await FoodTemperature.deleteMany({ location: user.siteLocation });
        await ProbeCalibration.deleteMany({ location: user.siteLocation });
        await Delivery.deleteMany({ location: user.siteLocation });
        await TemperatureRecord.deleteMany({ location: user.siteLocation });

        res.json({ msg: 'All records deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/records/:type/all
// @desc    Delete all records of a specific type for a location
// @access  Private
router.delete('/:type/all', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        let Model;

        switch (req.params.type) {
            case 'food-temperature':
                Model = FoodTemperature;
                break;
            case 'probe-calibration':
                Model = ProbeCalibration;
                break;
            case 'delivery':
                Model = Delivery;
                break;
            case 'temperature':
                Model = TemperatureRecord;
                break;
            default:
                return res.status(400).json({ msg: 'Invalid record type' });
        }

        await Model.deleteMany({ location: user.siteLocation });
        res.json({ msg: 'Records deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/records/:id
// @desc    Delete a single record
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const recordId = req.params.id;
        
        console.log('Attempting to delete record:', {
            recordId,
            userId: user.id,
            userRole: user.role,
            userLocation: user.siteLocation
        });

        // Try to find the record in each collection
        let record = await FoodTemperature.findById(recordId);
        let Model = FoodTemperature;

        if (!record) {
            record = await ProbeCalibration.findById(recordId);
            Model = ProbeCalibration;
        }
        if (!record) {
            record = await Delivery.findById(recordId);
            Model = Delivery;
        }
        if (!record) {
            record = await TemperatureRecord.findById(recordId);
            Model = TemperatureRecord;
        }

        if (!record) {
            console.log('Record not found:', recordId);
            return res.status(404).json({ msg: 'Record not found' });
        }

        console.log('Found record:', {
            recordId: record._id,
            type: record.type,
            createdBy: record.createdBy.toString(),
            location: record.location.toString()
        });

        // Check if user is authorized to delete (must be creator or admin)
        if (user.role !== 'admin' && record.createdBy.toString() !== user.id) {
            console.log('User not authorized to delete record:', {
                userRole: user.role,
                userId: user.id,
                recordCreator: record.createdBy.toString()
            });
            return res.status(401).json({ msg: 'Not authorized to delete this record' });
        }

        await Model.findByIdAndDelete(recordId);
        console.log('Record deleted successfully:', recordId);
        res.json({ msg: 'Record deleted successfully' });
    } catch (err) {
        console.error('Error deleting record:', err);
        res.status(500).json({ msg: 'Server error during deletion' });
    }
});

// @route   GET api/records/cooling-temperature
// @desc    Get cooling temperature records for a location
// @access  Private
router.get('/cooling-temperature', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const records = await CoolingTemperature.find({ location: user.siteLocation })
            .populate('createdBy', 'name')
            .sort({ coolingStartTime: -1 });
        res.json(records);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
   