const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_LOCAL, {
            // ssl: true,  // Enable SSL
            // tls: true,  // Enable TLS
            // tlsAllowInvalidCertificates: true,  // Allow invalid certificates (use with caution in development)
            // serverSelectionTimeoutMS: 5000,  // 5 seconds timeout
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
