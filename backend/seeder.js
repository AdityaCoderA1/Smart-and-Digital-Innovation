const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Challenge = require('./models/Challenge');
const RecyclingCenter = require('./models/RecyclingCenter');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const progressiveChallenges = [
    { title: 'Recycle 5 Plastic Items', description: 'Upload and recycle plastic waste items correctly.', points: 5, type: 'progressive', total_goal: 5 },
    { title: 'Visit 1 Recycling Center', description: 'Check-in at a nearby eco recycling center.', points: 10, type: 'progressive', total_goal: 1 },
    { title: 'Recycle 10 Plastic Items', description: 'Continue your plastic recycling streak.', points: 15, type: 'progressive', total_goal: 10 },
    { title: 'Recycle 20 Paper/Cardboard Items', description: 'Segregate and recycle paper waste.', points: 20, type: 'progressive', total_goal: 20 },
    { title: 'Upload 15 Organic Waste Classification', description: 'Use AI organic waste classification correctly.', points: 25, type: 'progressive', total_goal: 15 }
];

const dailyChallenges = [
    { title: 'Carry a Reusable Bottle', points: 10, type: 'daily', difficulty: 'Easy' },
    { title: 'Avoid Single-Use Plastic', points: 10, type: 'daily', difficulty: 'Easy' },
    { title: 'Plant One Small Seed', points: 50, type: 'daily', difficulty: 'Medium' },
    { title: 'Avoid Food Waste Today', points: 50, type: 'daily', difficulty: 'Medium' },
    { title: 'Spend a Day Without Plastic Bags', points: 100, type: 'daily', difficulty: 'Hard' },
    { title: 'Teach Someone Waste Segregation', points: 100, type: 'daily', difficulty: 'Hard' }
];

const centers = [
    { name: 'EcoDrop Center', type: 'E-Waste', lat: 28.6139, lng: 77.2090, description: 'Electronic and battery waste collection center.', items: ['Batteries', 'Phones', 'Electronics'] },
    { name: 'Green Earth Recycling', type: 'Plastic', lat: 19.0760, lng: 72.8777, description: 'Plastic, cardboard and metal recycling.', items: ['Plastic', 'Paper', 'Metal'] },
    { name: 'NatureCycle Hub', type: 'Organic', lat: 13.0827, lng: 80.2707, description: 'Organic compost and food waste center.', items: ['Organic', 'Compost', 'Food Waste'] },
    { name: 'ScrapSmart Dealer', type: 'Scrap', lat: 22.5726, lng: 88.3639, description: 'Local scrap collection and reuse facility.', items: ['Iron', 'Steel', 'Scrap'] }
];

const seedData = async () => {
    try {
        await Challenge.deleteMany();
        await RecyclingCenter.deleteMany();

        await Challenge.insertMany(progressiveChallenges);
        await Challenge.insertMany(dailyChallenges);
        await RecyclingCenter.insertMany(centers);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedData();
