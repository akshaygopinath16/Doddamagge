const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mobileUserSchema = new mongoose.Schema({
    username: {
        type: String, // email
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true // New field
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true // Phone must be unique for login
    },
    otp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

mobileUserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

mobileUserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('MobileUser', mobileUserSchema);
