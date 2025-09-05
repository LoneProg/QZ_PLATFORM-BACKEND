import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDB from "./config/db";
// import { startCountdown } from "./utils/countDown";
// import { executeScheduledAssignments } from "./utils/scheduler";

const port = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Start background jobs
// startCountdown();
// executeScheduledAssignments();

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api-docs`);
});
