const express = require("express");
const errorHandler = require("./middlewares/errorHandler");
const connectDB = require("./config/db");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");

// configuring server
const app = express();
const port = process.env.PORT || 3000;

// Middleware Configuration
app.use(express.json());
app.use("/api/users", require("./routes/userRoutes")); 
app.use("/api/groups", require("./routes/groupRoutes")); 
app.use("/api/tests", testRoutes);

app.use(errorHandler);

// Connect to MongoDB
connectDB();

// Running Server
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
