const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all users (Admin only)
router.get('/', protect, admin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update user profile (Protected)
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.username = req.body.username || user.username;
            if (req.body.password) {
                user.password = req.body.password;
            }
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                role: updatedUser.role
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update user role (Admin only)
router.put('/:id/role', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.role = req.body.role || user.role;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                role: updatedUser.role
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Toggle user activation status (Admin only)
router.patch('/:id/status', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // If body has specific status, use it (for explicit Activate/Deactivate) -> user service sends toggle currently but could send body.
        // Or just toggle if no body. 
        // User asked for "Activate" and "Deactivate" buttons. 
        // UI can call this endpoint. Let's support explicit setting if needed, or just toggle.
        // To be safe for "activate vs deactivate", explicit setting is better, but toggle is simple.
        // Let's stick to toggle logic for this endpoint to match existing service, 
        // OR update service to enable explicit setting. 
        // User request: "let it be activate and deactivate keys".
        // I'll stick to toggle logic but the UI will call it only when needed? 
        // Actually, if I click 'Activate' I expect it to become Active. If it was already active it should be disabled.
        // So toggle is fine because the button is only enabled when action is needed.

        user.isActive = !user.isActive;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            role: updatedUser.role,
            isActive: updatedUser.isActive
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
