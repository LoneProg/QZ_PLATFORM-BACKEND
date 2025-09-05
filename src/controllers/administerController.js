const asyncHandler = require('express-async-handler');
const Test = require('../models/tests');
const express = require('express');
const User = require('../models/Users');
// const Group = require('../models/Group');
const { sendMail } = require('../utils/sendEmail');
const { generateSharableLink } = require('../utils/generateSharebleLink'); // Updated utility
const { generateRandomPassword } = require('../utils/generatePassword');

// @Desc    Configure and administer a test
// @route   POST /api/tests/:testId/administer
// @access  public
const administerTest = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const { scheduling, timeAndAttempts, configuration, proctoring, assignment } =
    req.body;

  const test = await Test.findById(testId);
  if (!test) {
    return res.status(404).json({ message: 'Test not found' });
  }

  if (scheduling) {
    test.scheduling = {
      ...test.scheduling,
      ...scheduling,
      status: scheduling.endDate ? 'scheduled' : 'active',
    };
  }

  if (timeAndAttempts) {
    test.timeAndAttempts = {
      ...test.timeAndAttempts,
      ...timeAndAttempts,
    };
  }

  if (configuration) {
    test.configuration = {
      ...test.configuration,
      ...configuration,
    };

    if (!test.configuration.accessCode) {
      test.configuration.accessCode = generateRandomPassword(6);
    }
  }

  if (proctoring) {
    test.proctoring = {
      ...test.proctoring,
      ...proctoring,
    };
  }

  if (assignment) {
    if (assignment.scheduledAssignment) {
      test.assignment.scheduledAssignment = {
        ...test.assignment.scheduledAssignment,
        enabled: true,
        scheduledTime: new Date(assignment.scheduledAssignment.scheduledTime),
      };

      if (isNaN(test.assignment.scheduledAssignment.scheduledTime.getTime())) {
        return res
          .status(400)
          .json({ message: 'Invalid date format for scheduledTime' });
      }
    }

    if (assignment.method === 'manual') {
      test.assignment.method = 'manual';
      if (assignment.manualAssignment) {
        let individualUserIds = [];

        // Find ObjectIds for each email in individualUsers
        if (assignment.manualAssignment.individualUsers) {
          individualUserIds = await User.find({
            email: { $in: assignment.manualAssignment.individualUsers },
          }).select('_id');

          individualUserIds = individualUserIds.map(user => user._id);
        }

        test.assignment.manualAssignment = {
          ...test.assignment.manualAssignment,
          individualUsers: individualUserIds,
          groups: assignment.manualAssignment.groups || [],
        };
      }
    }

    if (assignment.method === 'email' && assignment.invitationEmails) {
      test.assignment.method = 'email';
      test.assignment.invitationEmails = assignment.invitationEmails;
    }

    if (assignment.method === 'link') {
      test.assignment.method = 'link';
      test.assignment.linkSharing = assignment.linkSharing || 'restricted';

      const link = generateSharableLink(test, assignment.linkSharing);
      await test.save(); // Save before returning link
      return res
        .status(200)
        .json({ message: 'Test configured successfully', test, link });
    }
  }

  try {
    await test.save();
    res.status(200).json({ message: 'Test administered successfully', test });
  } catch (error) {
    console.error('Error Administering Test:', error);
    res.status(500).json({ message: 'Failed to administer test', error });
  }
});

// @Desc    Get administration settings for a test
// @route   GET /api/tests/:testId/administer
// @access  Public
const getAdministerSettings = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  // Find the test by ID
  const test = await Test.findById(testId);

  if (!test) {
    return res.status(404).json({ message: 'Test not found' });
  }

  // Extracting administration-related details
  const administrationSettings = {
    scheduling: test.scheduling,
    timeAndAttempts: test.timeAndAttempts,
    configuration: test.configuration,
    proctoring: test.proctoring,
    assignment: test.assignment,
  };

  res.status(200).json({
    message: 'Administration settings retrieved successfully',
    administrationSettings,
  });
});

// @Desc    Update test configuration and administration settings
// @route   PATCH /api/tests/:testId/administer
// @access  private
const updateTestSettings = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const { scheduling, timeAndAttempts, configuration, proctoring } = req.body;

  // Find the test by ID
  const test = await Test.findById(testId);
  if (!test) {
    return res.status(404).json({ message: 'Test not found' });
  }

  // Update scheduling settings
  if (scheduling) {
    test.scheduling = {
      ...test.scheduling,
      ...scheduling,
      status: scheduling.endDate ? 'scheduled' : 'active',
    };
  }

  // Update time and attempts settings
  if (timeAndAttempts) {
    test.timeAndAttempts = {
      ...test.timeAndAttempts,
      ...timeAndAttempts,
    };
  }

  // Update test configuration settings
  if (configuration) {
    test.configuration = {
      ...test.configuration,
      ...configuration,
    };
  }

  // Update proctoring settings
  if (proctoring) {
    test.proctoring = {
      ...test.proctoring,
      ...proctoring,
    };
  }

  // Save the updated test
  try {
    await test.save();
    res
      .status(200)
      .json({ message: 'Test settings updated successfully', test });
  } catch (error) {
    console.error('Error Updating Test Settings:', error);
    res.status(500).json({ message: 'Failed to update test settings', error });
  }
});

module.exports = {
  administerTest,
  getAdministerSettings,
  updateTestSettings,
};
