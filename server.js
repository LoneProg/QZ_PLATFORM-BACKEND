const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const authHandler = require("./middlewares/authHandler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const { executeScheduledAssignments } = require('./utils/scheduler');
require('dotenv').config();
const { startCountdown } = require('./utils/countDown');

// Configuring server
const app = express();
const port = process.env.PORT || 3000;


// Middleware Configuration
app.use(express.json());
app.use("/api/users", require("./routes/userRoutes")); 
app.use("/api/groups", require("./routes/groupRoutes")); 
app.use("/api/auths", require("./routes/authRoutes"));
app.use("/api/tests", require("./routes/testRoutes"));
app.use("/api/tests/:testId/questions", require("./routes/questionRoutes"));
app.use("/api/questions", require("./routes/questionBankRoutes"));
app.use("/api/tests/administer", require("./routes/administerRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/superadmin", require("./routes/superAdminRoutes"));
app.use("/api/waitlist", require("./routes/waitlistRoutes"));
app.use(errorHandler);
app.use(cors());

// Start the countdown timer
startCountdown();

// Connect to MongoDB
connectDB();
// Integrate Scheduler
executeScheduledAssignments();
// Running Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
