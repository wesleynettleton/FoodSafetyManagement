const express = require('express');
const router = express.Router();
const Communication = require('../models/Communication');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Development only: Add sample communications
if (process.env.NODE_ENV === 'development') {
  router.post('/add-samples', [auth, admin], async (req, res) => {
    try {
      const sampleCommunications = [
        {
          title: "Important: New Food Safety Guidelines",
          content: "Please note that we have updated our food safety guidelines. All staff must review the new temperature requirements for hot and cold food storage. The new guidelines are now posted in the kitchen.",
          priority: "high",
          author: req.user._id
        },
        {
          title: "Weekly Equipment Maintenance",
          content: "Reminder: All fridges and freezers will be serviced this Thursday between 2-4 PM. Please ensure all food items are properly stored and labeled before the maintenance period.",
          priority: "medium",
          author: req.user._id
        },
        {
          title: "New Staff Training Session",
          content: "Welcome to our new team members! A mandatory food safety training session will be held this Friday at 10 AM in the main kitchen. All new staff must attend.",
          priority: "medium",
          author: req.user._id
        },
        {
          title: "Holiday Schedule Update",
          content: "The kitchen will be operating on a modified schedule during the upcoming holiday period. Please check the updated roster posted in the staff room.",
          priority: "low",
          author: req.user._id
        },
        {
          title: "URGENT: Temperature Log Issue",
          content: "We've noticed some inconsistencies in the temperature logs. Please ensure all temperature readings are recorded immediately after taking them. Double-check your entries before submitting.",
          priority: "high",
          author: req.user._id
        }
      ];

      // Insert the communications
      const communications = await Communication.insertMany(sampleCommunications);
      
      // Populate author information
      const populatedCommunications = await Communication.find({ _id: { $in: communications.map(c => c._id) } })
        .populate('author', 'name');
      
      res.status(201).json(populatedCommunications);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
}

// Get all communications (admin only)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const communications = await Communication.find()
      .populate('author', 'name')
      .populate('readBy.user', 'name')
      .sort({ createdAt: -1 });
    res.json(communications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get communications for a specific user
router.get('/my-communications', auth, async (req, res) => {
  try {
    const communications = await Communication.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    
    // Add read status for the current user
    const communicationsWithReadStatus = communications.map(comm => {
      const readStatus = comm.readBy.find(
        read => read.user._id.toString() === req.user._id.toString()
      );
      return {
        ...comm.toObject(),
        isRead: !!readStatus,
        readAt: readStatus ? readStatus.readAt : null
      };
    });

    res.json(communicationsWithReadStatus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new communication (admin only)
router.post('/', [auth, admin], async (req, res) => {
  const communication = new Communication({
    title: req.body.title,
    content: req.body.content,
    priority: req.body.priority,
    author: req.user._id
  });

  try {
    const newCommunication = await communication.save();
    const populatedCommunication = await Communication.findById(newCommunication._id)
      .populate('author', 'name');
    res.status(201).json(populatedCommunication);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Mark a communication as read
router.post('/:id/read', auth, async (req, res) => {
  try {
    const communication = await Communication.findById(req.params.id);
    if (!communication) {
      return res.status(404).json({ message: 'Communication not found' });
    }

    // Check if already read by this user
    const alreadyRead = communication.readBy.some(
      read => read.user.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      communication.readBy.push({
        user: req.user._id,
        readAt: Date.now()
      });
      await communication.save();
    }

    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a communication (admin only)
router.patch('/:id', [auth, admin], async (req, res) => {
  try {
    const communication = await Communication.findById(req.params.id);
    if (!communication) {
      return res.status(404).json({ message: 'Communication not found' });
    }

    if (req.body.title) communication.title = req.body.title;
    if (req.body.content) communication.content = req.body.content;
    if (req.body.priority) communication.priority = req.body.priority;

    const updatedCommunication = await communication.save();
    const populatedCommunication = await Communication.findById(updatedCommunication._id)
      .populate('author', 'name')
      .populate('readBy.user', 'name');
    res.json(populatedCommunication);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a communication (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const communication = await Communication.findById(req.params.id);
    if (!communication) {
      return res.status(404).json({ message: 'Communication not found' });
    }

    await communication.remove();
    res.json({ message: 'Communication deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 