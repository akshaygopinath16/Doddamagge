const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);

// Get all payments (Admin sees all? Or user sees theirs?)
// Assuming Admin sees all, User sees theirs
router.get('/', async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'admin') {
            query = { user: req.user.username }; // Filter by username string stored in payment
        }
        const payments = await Payment.find(query).sort({ date: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create payment
router.post('/', async (req, res) => {
    const payment = new Payment({
        user: req.body.user,
        amount: req.body.amount,
        status: req.body.status || 'Pending',
        date: req.body.date // Optional, defaults to now
    });

    try {
        const newPayment = await payment.save();
        res.status(201).json(newPayment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update payment status (Admin only)
router.patch('/:id/status', admin, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        payment.status = req.body.status;
        const updatedPayment = await payment.save();
        res.json(updatedPayment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update payment details (Admin only)
router.put('/:id', admin, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        payment.amount = req.body.amount !== undefined ? req.body.amount : payment.amount;
        payment.date = req.body.date || payment.date;
        payment.status = req.body.status || payment.status;
        payment.user = req.body.user || payment.user;

        const updatedPayment = await payment.save();
        res.json(updatedPayment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete payment (Admin only)
router.delete('/:id', admin, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        await payment.deleteOne();
        res.json({ message: 'Payment removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
