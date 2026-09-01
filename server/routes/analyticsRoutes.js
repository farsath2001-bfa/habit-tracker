const express = require('express');
const {
  getDashboardAnalytics,
  getWeeklyAnalytics,
  getMonthlyAnalytics,
  getStreakAnalytics,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.get('/weekly', getWeeklyAnalytics);
router.get('/monthly', getMonthlyAnalytics);
router.get('/streaks', getStreakAnalytics);

module.exports = router;
