const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daz_learning', {
            serverSelectionTimeoutMS: 2500,
            connectTimeoutMS: 2500
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.warn('MongoDB connection error (running in fallback/standalone mode):', err.message);
        mongoose.set('bufferCommands', false);
    }
};

module.exports = connectDB;

