const multer = require('multer');
const path = require('path');
const WasteUpload = require('../models/WasteUpload');
const User = require('../models/User');

// Setup Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// @desc    Upload waste image
// @route   POST /api/uploads
// @access  Private
const uploadWaste = async (req, res) => {
    try {
        const file = req.file;
        const { type, weight } = req.body;

        if (!file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const pointsToAward = 10; // Fixed points for now

        // Create upload record
        const wasteUpload = await WasteUpload.create({
            user: req.user.id,
            image_url: `/uploads/${file.filename}`,
            type: type || 'Unknown',
            weight: weight || 0,
            points_awarded: pointsToAward
        });

        // Update User Stats
        const user = await User.findById(req.user.id);
        user.totalPoints += pointsToAward;
        user.stats.uploaded += 1;
        
        // Update Waste Distribution (simple implementation)
        const distributionIndex = user.wasteDistribution.findIndex(w => w.label === type);
        if (distributionIndex >= 0) {
            user.wasteDistribution[distributionIndex].value += 1;
        } else {
            user.wasteDistribution.push({ label: type, value: 1 });
        }

        await user.save();

        res.status(201).json({
            message: 'Upload successful',
            upload: wasteUpload,
            newTotalPoints: user.totalPoints
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    upload,
    uploadWaste
};
