const express = require("express");
const errorHandler = require("./middlewares/errorHandler");
const authHandler = require("./middlewares/authHandler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
require('dotenv').config();

// configuring server
const app = express();
const port = process.env.PORT || 3000;

// Middleware Configuration
app.use(express.json());

// Include routes
app.use("/api/users", require("./routes/userRoutes")); 
app.use("/api/groups", require("./routes/groupRoutes")); 
app.use("/api/auths", require("./routes/authRoutes"));
app.use("/api/tests", require("./routes/testRoutes"));

// Use a single questionRoutes.js for both Question Bank and Test-specific questions
app.use("/api/questions", require("./routes/questionRoutes"));  // Routes for Question Bank
app.use("/api/tests/:testId/questions", require("./routes/questionRoutes"));  // Routes for Test-specific questions

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
connectDB();

// Running Server
app.listen(port, () => {
    console.log(`Server running on ${port}`);
});
