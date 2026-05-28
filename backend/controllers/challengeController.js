const Challenge = require('../models/Challenge');
const User = require('../models/User');

// @desc    Get all challenges
// @route   GET /api/challenges
// @access  Public
const getChallenges = async (req, res) => {
    try {
        const challenges = await Challenge.find({});
        res.json(challenges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user challenge progress
// @route   POST /api/challenges/progress
// @access  Private
const updateProgress = async (req, res) => {
    try {
        const { challengeId } = req.body;
        const challenge = await Challenge.findById(challengeId);
        
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        const user = await User.findById(req.user.id);
        
        // Prevent completing the same challenge multiple times if it's not repeatable (assume one-time for now)
        if (user.completedChallenges.includes(challengeId)) {
            return res.status(400).json({ message: 'Challenge already completed' });
        }

        user.completedChallenges.push(challengeId);
        user.totalPoints += challenge.points;
        user.stats.challenges += 1;
        
        // Recalculate ecoProgress (simple mock calculation)
        const totalChallengesCount = await Challenge.countDocuments();
        user.ecoProgress = Math.floor((user.completedChallenges.length / totalChallengesCount) * 100);

        await user.save();

        res.json({ message: 'Progress updated', points: challenge.points, totalPoints: user.totalPoints, ecoProgress: user.ecoProgress });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getChallenges,
    updateProgress
};
