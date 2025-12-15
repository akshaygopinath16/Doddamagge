const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: String,
    image: String,
    status: {
        type: String,
        enum: ['pending', 'approved'],
        default: 'pending'
    }
});

module.exports = mongoose.model('Event', eventSchema);
