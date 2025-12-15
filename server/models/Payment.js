const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Completed', 'Pending', 'Failed'],
        default: 'Pending'
    },
    date: {
        type: String, // Storing as YYYY-MM-DD for simplicity matching frontend
        default: () => new Date().toISOString().split('T')[0]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Payment', paymentSchema);
