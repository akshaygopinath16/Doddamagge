const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const sendEmail = require('../utils/emailService');

// Set up storage engine
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../uploads/'),
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('image');

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// Get events (Admin: All, User: Approved only)
router.get('/', protect, async (req, res) => {
    try {
        let query = { status: 'approved' };
        if (req.user && req.user.role === 'admin') {
            query = {}; // Admin sees all
        }
        const events = await Event.find(query).sort({ date: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create event
router.post('/', protect, (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err });
        }

        // Default status: Admin -> approved, User -> pending
        const status = req.user.role === 'admin' ? 'approved' : 'pending';

        console.log('File Upload Debug:', req.file);
        if (req.file) console.log('Saved to:', req.file.path);

        const event = new Event({
            title: req.body.title,
            date: req.body.date,
            location: req.body.location,
            description: req.body.description,
            image: req.file ? `/uploads/${req.file.filename}` : '',
            status: status
        });

        try {
            const newEvent = await event.save();
            res.status(201).json({ ...newEvent._doc, id: newEvent._id });
        } catch (dbErr) {
            res.status(400).json({ message: dbErr.message });
        }
    });
});

// Delete event (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        await event.deleteOne();
        res.json({ message: 'Event removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update event status (Admin only)
router.patch('/:id/status', protect, admin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        event.status = req.body.status;
        const updatedEvent = await event.save();

        // Send Email Notification if Approved
        if (req.body.status === 'approved') {
            try {
                await sendEmail({
                    email: 'user@example.com', // In real app, fetch event.creator.email
                    subject: 'Your Event Has Been Approved!',
                    message: `Congratulations! Your event "${event.title}" has been approved and is now live.`
                });
            } catch (emailErr) {
                console.error('Email sending failed:', emailErr);
                // Don't fail the request if email fails
            }
        }

        res.json(updatedEvent);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update event details (Admin only) - Simplified (no image update for now to keep it simple, or handle multipart if needed)
router.put('/:id', protect, admin, (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err });

        try {
            const event = await Event.findById(req.params.id);
            if (!event) return res.status(404).json({ message: 'Event not found' });

            event.title = req.body.title || event.title;
            event.date = req.body.date || event.date;
            event.location = req.body.location || event.location;
            event.description = req.body.description || event.description;
            if (req.file) {
                event.image = `/uploads/${req.file.filename}`;
            }

            const updatedEvent = await event.save();
            res.json(updatedEvent);
        } catch (dbErr) {
            res.status(500).json({ message: dbErr.message });
        }
    });
});

module.exports = router;
