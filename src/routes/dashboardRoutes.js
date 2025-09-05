const express = require("express");
const {
  getDashboardOverview,
  getRecentlyCreatedTests,
  getRecentlyScheduledTests,
  getRecentTestTakers,
} = require("../controllers/dashboardController");

const router = express.Router();

//GET Test Creator Dashboard Overview
router.get("/overview", getDashboardOverview);

//GET List or Recently Created Tests
router.get("/recent-tests", getRecentlyCreatedTests);

// GET List of Scheduled Tests
router.get("/scheduled-tests", getRecentlyScheduledTests);

//Get Recent Test Takers
router.get("/recent-test-takers", getRecentTestTakers);

module.exports = router;
