const express = require('express');
const router = express.Router();
const { getUserProfile, getLeaderboard } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getUserProfile);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
