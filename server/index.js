const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const paymentRoutes = require('./routes/payments');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const mobileAuthRoutes = require('./routes/mobileAuth');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mobile-auth', mobileAuthRoutes);

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/admin_panel')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('DB Connection Error:', err));

// Serve Static Assets in Production
// Assuming the frontend build is in ../dist (standard Vite output relative to server folder)
app.use(express.static(path.join(__dirname, '../dist')));

app.get(/.*/, (req, res) => {
    // If request doesn't match an API route, send index.html
    // Check if we are in API route first to avoid serving html for 404 api calls?
    // Express order matters: API routes defined above will handle /api/... 
    // This wildcard catches everything else.
    res.sendFile(path.resolve(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

