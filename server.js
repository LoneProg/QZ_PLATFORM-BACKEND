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
app.use("/api/users", require("./routes/userRoutes")); 
app.use("/api/groups", require("./routes/groupRoutes")); 
app.use("/api/auths", require("./routes/authRoutes"));
app.use("/api/tests", require("./routes/testRoutes"));
app.use("/api/tests/:testId/questions", require("./routes/questionRoutes"));
app.use("/api/questions", require("./routes/questionBankRoutes"))

app.use(errorHandler);

// Connect to MongoDB
connectDB();

// Running Server
app.listen(port, () => {
    console.log(`Server running on ${port}`);
});
