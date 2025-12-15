const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const MobileUser = require('../models/MobileUser');

const generateToken = (id, username, name) => {
    return jwt.sign({ id, username, name, role: 'user' }, process.env.JWT_SECRET || 'secret_key_123', {
        expiresIn: '365d'
    });
};

// Register
router.post('/register', async (req, res) => {
    const { username, password, name, phoneNumber } = req.body;
    try {
        const userExists = await MobileUser.findOne({ $or: [{ username }, { phoneNumber }] });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email or phone already exists' });
        }
        const user = await MobileUser.create({ username, password, name, phoneNumber });
        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                name: user.name,
                phoneNumber: user.phoneNumber,
                token: generateToken(user._id, user.username, user.name)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login (Password)
router.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
    try {
        const user = await MobileUser.findOne({
            $or: [{ username: identifier }, { phoneNumber: identifier }]
        });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                name: user.name,
                phoneNumber: user.phoneNumber,
                token: generateToken(user._id, user.username, user.name)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/send-otp', async (req, res) => {
    const { phoneNumber } = req.body;
    try {
        const user = await MobileUser.findOne({ phoneNumber });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();
        console.log(`[OTP DEBUG] OTP for ${phoneNumber} is ${otp}`);
        res.json({ message: 'OTP sent', debug_otp: otp });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/login-otp', async (req, res) => {
    const { phoneNumber, otp } = req.body;
    try {
        const user = await MobileUser.findOne({ phoneNumber });
        if (user && user.otp === otp && user.otpExpires > Date.now()) {
            user.otp = null;
            user.otpExpires = null;
            await user.save();
            res.json({
                _id: user._id,
                username: user.username,
                name: user.name,
                phoneNumber: user.phoneNumber,
                token: generateToken(user._id, user.username, user.name)
            });
        } else {
            res.status(401).json({ message: 'Invalid OTP' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
