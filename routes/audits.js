const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Location = require('../models/Location');
const Audit = require('../models/Audit');
const notificationService = require('../services/notificationService');

// @route   POST api/audits
// @desc    Create a new audit
// @access  Private (Admin only)
router.post('/', [
    auth,
    check('location', 'Location is required').not().isEmpty(),
    check('auditor', 'Auditor name is required').not().isEmpty(),
    check('auditDate', 'Audit date is required').isISO8601()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id);
        
        // Check if user is admin
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admin role required.' });
        }

        const { location, auditor, auditDate, sections, status } = req.body;



        const audit = new Audit({
            location,
            auditor,
            auditDate: new Date(auditDate),
            sections: sections || [],
            status: status || 'draft',
            createdBy: user.id
        });

        // Calculate statistics
        audit.calculateStats();
        
        await audit.save();
        
        // Populate location details for response
        await audit.populate('location', 'name address');
        await audit.populate('createdBy', 'name');
        
        // Send notification to kitchen staff at the audited location
        if (audit.status === 'completed') {
            try {
                await notificationService.sendAuditCompletedNotification(audit);
            } catch (error) {
                console.error('Error sending audit notification:', error);
                // Don't fail the audit creation if notification fails
            }
        }
        
        res.json(audit);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/audits
// @desc    Get all audits (admin) or user's location audits (kitchen staff)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        let query = {};

        // If kitchen staff, only show audits for their location
        if (user.role === 'kitchen_staff') {
            query.location = user.siteLocation;
        }

        // Get page and limit from query params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const totalCount = await Audit.countDocuments(query);

        // Get audits with minimal data for list view (exclude photos and detailed sections)
        const audits = await Audit.find(query)
            .select('location auditor auditDate status totalItems completedItems compliantItems nonCompliantItems score createdAt updatedAt createdBy')
            .populate('location', 'name address')
            .populate('createdBy', 'name')
            .sort({ auditDate: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            audits,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                hasNextPage: page * limit < totalCount,
                hasPrevPage: page > 1
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/audits/:id
// @desc    Get audit by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const audit = await Audit.findById(req.params.id)
            .populate('location', 'name address')
            .populate('createdBy', 'name');

        if (!audit) {
            return res.status(404).json({ msg: 'Audit not found' });
        }

        // Check access: admin can see all, kitchen staff can only see their location's audits
        if (user.role === 'kitchen_staff' && audit.location._id.toString() !== user.siteLocation.toString()) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        res.json(audit);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Audit not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/audits/:id
// @desc    Update audit
// @access  Private (Admin only)
router.put('/:id', [
    auth,
    check('auditor', 'Auditor name is required').not().isEmpty(),
    check('auditDate', 'Audit date is required').isISO8601()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id);
        
        // Check if user is admin
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admin role required.' });
        }

        let audit = await Audit.findById(req.params.id);

        if (!audit) {
            return res.status(404).json({ msg: 'Audit not found' });
        }

        const { auditor, auditDate, sections, status } = req.body;

        // Update audit fields
        audit.auditor = auditor;
        audit.auditDate = new Date(auditDate);
        if (sections) audit.sections = sections;
        if (status) audit.status = status;

        // Recalculate statistics
        audit.calculateStats();
        
        await audit.save();
        
        // Populate details for response
        await audit.populate('location', 'name address');
        await audit.populate('createdBy', 'name');
        
        res.json(audit);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Audit not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/audits/:id
// @desc    Delete audit
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Check if user is admin
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admin role required.' });
        }

        const audit = await Audit.findById(req.params.id);

        if (!audit) {
            return res.status(404).json({ msg: 'Audit not found' });
        }

        await audit.deleteOne();
        
        res.json({ msg: 'Audit deleted successfully' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Audit not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET api/audits/location/:locationId
// @desc    Get audits for specific location
// @access  Private
router.get('/location/:locationId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Check access: admin can see all, kitchen staff can only see their location
        if (user.role === 'kitchen_staff' && req.params.locationId !== user.siteLocation.toString()) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const audits = await Audit.find({ location: req.params.locationId })
            .populate('location', 'name address')
            .populate('createdBy', 'name')
            .sort({ auditDate: -1 })
            .limit(100); // Limit to 100 most recent audits

        res.json(audits);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 