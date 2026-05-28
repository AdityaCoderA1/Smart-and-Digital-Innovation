const express = require('express');
const router = express.Router();
const { getChallenges, updateProgress } = require('../controllers/challengeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getChallenges);
router.route('/progress').post(protect, updateProgress);

module.exports = router;
