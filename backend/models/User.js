const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    ecoProgress: {
        type: Number,
        default: 0
    },
    stats: {
        uploaded: { type: Number, default: 0 },
        detections: { type: Number, default: 0 },
        challenges: { type: Number, default: 0 },
        trips: { type: Number, default: 0 }
    },
    wasteDistribution: [{
        label: String,
        value: Number
    }],
    completedChallenges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge'
    }]
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
