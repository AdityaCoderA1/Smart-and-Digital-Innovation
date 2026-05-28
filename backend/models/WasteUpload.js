const mongoose = require('mongoose');

const WasteUploadSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image_url: {
        type: String,
        required: true
    },
    type: {
        type: String, // e.g., 'Plastic', 'Organic', 'E-Waste', etc.
        required: true
    },
    weight: {
        type: Number // in kg or grams
    },
    points_awarded: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('WasteUpload', WasteUploadSchema);
