const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    points: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['progressive', 'daily'],
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'] // Mostly for daily challenges
    },
    total_goal: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

module.exports = mongoose.model('Challenge', ChallengeSchema);
