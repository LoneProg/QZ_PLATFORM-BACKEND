const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TestSchema = new Schema(
  {
    testName: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    createdBy: { type: String, required: true },
    instruction: { type: String },
    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],

    // Scheduling settings
    scheduling: {
      startDate: { type: Date },
      endDate: { type: Date },
      status: {
        type: String,
        enum: ["unscheduled", "scheduled", "active", "expired", "closed"],
      },
    },

    // Time and attempts settings
    timeAndAttempts: {
      timeLimit: { type: Number }, // Time limit in minutes
      attempts: { type: Number, default: 1 },
    },

    // Test configuration settings
    configuration: {
      randomizeQuestions: { type: Boolean, default: false },
      passingScore: { type: Number, default: 0 },
      accessCode: { type: String },
    },

    // Simplified proctoring settings
    proctoring: {
      allowEdit: { type: Boolean, default: false }, // Controls editing, copying, pasting, and selecting
    },

    // Assignment settings
    assignment: {
      method: {
        type: String,
        enum: ["manual", "email", "link"],
        default: "manual",
      }, // Assignment method

      // Scheduled assignment settings
      scheduledAssignment: {
        enabled: { type: Boolean, default: false },
        scheduledTime: { type: Date }, // The date and time when the test should be assigned
      },

      // Fields for manual assignment
      manualAssignment: {
        individualUsers: [{ type: Schema.Types.ObjectId, ref: "User" }], // Array of individual user IDs
        groups: [{ type: Schema.Types.ObjectId, ref: "Group" }], // Array of group IDs
      },

      // For email invitations
      invitationEmails: [{ type: String }],

      // Link sharing type
      linkSharing: {
        type: String,
        enum: ["public", "restricted"],
        default: "restricted",
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  },
);

module.exports = mongoose.model("Test", TestSchema);
