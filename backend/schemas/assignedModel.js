const mongoose = require("mongoose");

const assignedModel = mongoose.Schema(
  {
    studentID: {
      type: String,
      required: [true, 'studentID required'],
    },
    teacherID: {
      type: String,
      required: [true, 'teacherID required'],
    },
    assessmentID: {
      type: String,
      required: [true, 'assessmentID required'],
    },
    assignedDate: {
      type: Date,
      default: new Date(),
    },
    status: {
      type: String,
      default: "pending",
    },
    contents: {
      type: Object,
    },
    Marks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const assignedSchema = mongoose.model("assignedSchema", assignedModel);

module.exports = assignedSchema;
