const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Location = require('../models/Location');
const User = require('../models/User');

// @route   POST api/locations
// @desc    Create a location
// @access  Private (Admin only)
router.post('/', [
    auth,
    check('name', 'Name is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const { name } = req.body;
        const location = new Location({ name });
        await location.save();
        res.json(location);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/locations
// @desc    Get all locations
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const locations = await Location.find().sort({ name: 1 });
        res.json(locations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/locations/:id
// @desc    Delete a location
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const location = await Location.findById(req.params.id);
        if (!location) {
            return res.status(404).json({ msg: 'Location not found' });
        }

        // Check if location is assigned to any users
        const usersWithLocation = await User.find({ siteLocation: req.params.id });
        if (usersWithLocation.length > 0) {
            return res.status(400).json({ msg: 'Cannot delete location that is assigned to users' });
        }

        await location.remove();
        res.json({ msg: 'Location removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 