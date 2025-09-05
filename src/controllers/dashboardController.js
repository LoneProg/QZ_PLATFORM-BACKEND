const asyncHandler = require("express-async-handler");
const Test = require("../models/tests"); // Replace with your actual Test model
const User = require("../models/Users"); // Replace with your actual User model

// @desc    Get dashboard overview
// @route   GET /api/dashboard/overview
// @access  Public
const getDashboardOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Assuming req.user is set by authentication middleware

  try {
    // Aggregate counts for overview
    const totalTests = await Test.countDocuments({ createdBy: userId });
    const totalScheduledTests = await Test.countDocuments({
      createdBy: userId,
      "scheduling.status": "scheduled",
    });
    const totalFinishedTests = await Test.countDocuments({
      createdBy: userId,
      "scheduling.status": "finished",
    });
    const totalInProgressTests = await Test.countDocuments({
      createdBy: userId,
      "scheduling.status": "active",
    });
    const totalTestTakers = await User.countDocuments({ role: "testTaker" });

    res.status(200).json({
      message: "Dashboard overview retrieved successfully",
      data: {
        totalTests,
        totalScheduledTests,
        totalFinishedTests,
        totalInProgressTests,
        totalTestTakers,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve dashboard overview", error });
  }
});

// @desc    Get recently created tests
// @route   GET /api/dashboard/recently-created-tests
// @access  Public
const getRecentlyCreatedTests = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const recentTests = await Test.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      message: "Recently created tests retrieved successfully",
      data: recentTests,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve recently created tests", error });
  }
});

// @desc    Get recently scheduled tests
// @route   GET /api/dashboard/recently-scheduled-tests
// @access  Public
const getRecentlyScheduledTests = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const recentScheduledTests = await Test.find({
      createdBy: userId,
      "scheduling.status": "scheduled",
    })
      .sort({ "scheduling.startDate": -1 })
      .limit(5);

    res.status(200).json({
      message: "Recently scheduled tests retrieved successfully",
      data: recentScheduledTests,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve recently scheduled tests", error });
  }
});

// @desc    Get recent test taker tracker list
// @route   GET /api/dashboard/recent-test-takers
// @access  Public
const getRecentTestTakers = asyncHandler(async (req, res) => {
  try {
    const recentTestTakers = await User.find({ role: "testTaker" })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      message: "Recent test taker tracker list retrieved successfully",
      data: recentTestTakers,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to retrieve recent test taker tracker list",
        error,
      });
  }
});

// @desc    Get Upcoming Tests
// @route   GET /api/dashboard/tests/upcoming
// @access  Public
const getUpcomingTests = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const upcomingTests = await Test.find({
      createdBy: userId,
      "scheduling.startDate": { $gt: new Date() },
    });

    res.status(200).json({
      message: "Upcoming tests retrieved successfully",
      data: upcomingTests,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve upcoming tests", error });
  }
});

// @desc    Get Test Performance Summary
// @route   GET /api/dashboard/tests/performance-summary
// @access  Public
const getTestPerformanceSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const performanceSummary = await Test.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: "$results.score" },
          passRate: {
            $avg: {
              $cond: [{ $gte: ["$results.score", "$passingScore"] }, 1, 0],
            },
          },
        },
      },
    ]);

    res.status(200).json({
      message: "Performance summary retrieved successfully",
      data: performanceSummary,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve performance summary", error });
  }
});

module.exports = {
  getDashboardOverview,
  getRecentlyCreatedTests,
  getRecentlyScheduledTests,
  getRecentTestTakers,
  getUpcomingTests,
  getTestPerformanceSummary,
};
