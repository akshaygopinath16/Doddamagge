const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Event = require('../models/Event');
const User = require('../models/User'); // Import User model for accurate user count
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Helper to get month name
const getMonthName = (monthIndex) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthIndex];
};

router.get('/stats', async (req, res) => {
    try {
        // 1. Total Revenue
        const revenueAgg = await Payment.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueAgg[0]?.total || 0;

        // 2. Active Users (Count of all users in DB, not just payers)
        const totalUsers = await User.countDocuments({ role: 'user' }); // Only regular users

        // 3. Total Events
        const totalEvents = await Event.countDocuments();

        // 4. Revenue Trend (Current Month vs Last Month)
        const now = new Date();
        const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonth = lastMonthDate.toISOString().slice(0, 7); // YYYY-MM

        const currentMonthRevenue = await Payment.aggregate([
            {
                $match: {
                    status: 'Completed',
                    date: { $regex: `^${currentMonth}` }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const lastMonthRevenue = await Payment.aggregate([
            {
                $match: {
                    status: 'Completed',
                    date: { $regex: `^${lastMonth}` }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const curRev = currentMonthRevenue[0]?.total || 0;
        const lastRev = lastMonthRevenue[0]?.total || 0;

        let revenueTrend = 0;
        if (lastRev === 0) {
            revenueTrend = curRev > 0 ? 100 : 0;
        } else {
            revenueTrend = ((curRev - lastRev) / lastRev) * 100;
        }

        res.json({
            revenue: totalRevenue,
            activeUsers: totalUsers,
            events: totalEvents,
            revenueTrend: parseFloat(revenueTrend.toFixed(1)),
            usersTrend: 12.5 // Placeholder for user growth, difficult without 'createdAt' on Users
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.get('/activity', async (req, res) => {
    try {
        // Get last 6 months
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push(d.toISOString().slice(0, 7)); // YYYY-MM
        }

        const activityData = [];

        for (const monthStr of months) {
            const result = await Payment.aggregate([
                {
                    $match: {
                        status: 'Completed',
                        date: { $regex: `^${monthStr}` }
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            // Format monthStr '2023-12' to 'Dec'
            const dateObj = new Date(monthStr + '-01');
            const monthName = getMonthName(dateObj.getMonth());

            activityData.push({
                name: monthName,
                value: result[0]?.total || 0
            });
        }

        res.json(activityData);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
