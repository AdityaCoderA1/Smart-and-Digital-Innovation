const RecyclingCenter = require('../models/RecyclingCenter');

// @desc    Get all recycling centers
// @route   GET /api/centers
// @access  Public
const getCenters = async (req, res) => {
    try {
        const centers = await RecyclingCenter.find({});
        res.json(centers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCenters
};
