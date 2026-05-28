const mongoose = require('mongoose');

const RecyclingCenterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['E-Waste', 'Plastic', 'Organic', 'Scrap', 'All'],
        required: true
    },
    lat: {
        type: Number,
        required: true
    },
    lng: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    items: [{
        type: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('RecyclingCenter', RecyclingCenterSchema);
