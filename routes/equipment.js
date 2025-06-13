const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Equipment = require('../models/Equipment');
const User = require('../models/User');

// @route   GET api/equipment
// @desc    Get all equipment for a location
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const equipment = await Equipment.find({ location: user.siteLocation });
        res.json(equipment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/equipment
// @desc    Create equipment
// @access  Private
router.post('/', [
    auth,
    check('name', 'Equipment name is required').not().isEmpty(),
    check('type', 'Equipment type is required').isIn(['fridge', 'freezer'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id);
        const equipment = new Equipment({
            name: req.body.name,
            type: req.body.type,
            location: user.siteLocation
        });

        await equipment.save();
        res.json(equipment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/equipment/:id
// @desc    Update equipment
// @access  Private
router.put('/:id', [
    auth,
    check('name', 'Equipment name is required').not().isEmpty(),
    check('type', 'Equipment type is required').isIn(['fridge', 'freezer'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id);
        let equipment = await Equipment.findById(req.params.id);

        if (!equipment) {
            return res.status(404).json({ msg: 'Equipment not found' });
        }

        // Check if equipment belongs to user's location
        if (equipment.location.toString() !== user.siteLocation.toString()) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        equipment = await Equipment.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                type: req.body.type
            },
            { new: true }
        );

        res.json(equipment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/equipment/:id
// @desc    Delete equipment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const equipment = await Equipment.findById(req.params.id);

        if (!equipment) {
            return res.status(404).json({ msg: 'Equipment not found' });
        }

        // Check if equipment belongs to user's location
        if (equipment.location.toString() !== user.siteLocation.toString()) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // Check if there are any temperature records associated with this equipment
        const { TemperatureRecord } = require('../models/Record');
        const existingRecords = await TemperatureRecord.find({ equipment: equipment._id });
        
        if (existingRecords.length > 0) {
            // Update all temperature records to preserve the equipment name as a string
            // and remove the equipment reference
            await TemperatureRecord.updateMany(
                { equipment: equipment._id },
                { 
                    $set: { 
                        equipmentName: equipment.name, // Store equipment name as string
                        equipmentType: equipment.type  // Store equipment type as string
                    },
                    $unset: { equipment: "" } // Remove the equipment reference
                }
            );
            
            console.log(`Updated ${existingRecords.length} temperature records for deleted equipment: ${equipment.name}`);
        }

        // Now delete the equipment
        await Equipment.findByIdAndDelete(req.params.id);
        res.json({ 
            msg: `Equipment "${equipment.name}" removed successfully. ${existingRecords.length} temperature records have been preserved with equipment name.` 
        });
    } catch (err) {
        console.error('Error deleting equipment:', err);
        
        // Check for specific MongoDB errors
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Equipment cannot be deleted due to existing references' });
        }
        
        res.status(500).json({ msg: 'Failed to delete equipment. Please try again or contact an administrator.' });
    }
});

module.exports = router; 