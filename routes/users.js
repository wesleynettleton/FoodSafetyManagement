const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const users = await User.find().select('-password').populate('siteLocation', 'name');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/users
// @desc    Create a user
// @access  Private (Admin only)
router.post('/', [
    auth,
    check('name', 'Name is required').not().isEmpty(),
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('role', 'Role is required').isIn(['admin', 'kitchen_staff']),
    check('siteLocation', 'Site location is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const admin = await User.findById(req.user.id);
        if (admin.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const { name, username, email, password, role, siteLocation } = req.body;

        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'Username already exists' });
        }

        user = new User({
            name,
            username,
            email,
            password,
            role,
            siteLocation
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/users/:id
// @desc    Update a user
// @access  Private (Admin only)
router.put('/:id', [
    auth,
    check('name', 'Name is required').not().isEmpty(),
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('role', 'Role is required').isIn(['admin', 'kitchen_staff']),
    check('siteLocation', 'Site location is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const performingAdmin = await User.findById(req.user.id);
        if (performingAdmin.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const { name, username, email, role, siteLocation } = req.body;

        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (username !== user.username) {
            const existingUserByUsername = await User.findOne({ username });
            if (existingUserByUsername) {
                return res.status(400).json({ msg: 'Username already in use' });
            }
        }

        if (email !== user.email) {
            const existingUserByEmail = await User.findOne({ email, _id: { $ne: req.params.id } });
            if (existingUserByEmail) {
                return res.status(400).json({ msg: 'Email already in use' });
            }
        }

        user.name = name;
        user.username = username;
        user.email = email;
        user.role = role;
        user.siteLocation = siteLocation;

        if (req.body.password && req.body.password.length >= 6) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        } else if (req.body.password && req.body.password.length > 0) {
            return res.status(400).json({ errors: [{ msg: 'Password must be at least 6 characters long' }] });
        }

        await user.save();
        const userToReturn = user.toObject();
        delete userToReturn.password;
        res.json(userToReturn);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/users/fcm-token
// @desc    Update user's FCM token for push notifications
// @access  Private
router.put('/fcm-token', auth, async (req, res) => {
    try {
        const { fcmToken, platform = 'android' } = req.body;
        
        if (!fcmToken) {
            return res.status(400).json({ msg: 'FCM token is required' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Remove existing token for this platform
        user.fcmTokens = user.fcmTokens.filter(token => token.platform !== platform);
        
        // Add new token
        user.fcmTokens.push({
            token: fcmToken,
            platform: platform
        });

        await user.save();
        
        res.json({ msg: 'FCM token updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/users/:id
// @desc    Delete a user
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (admin.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        await user.remove();
        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 