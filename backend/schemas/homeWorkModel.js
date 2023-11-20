const mongoose = require("mongoose");

const homeWorkModel = mongoose.Schema(
  {
    studentID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: [true, "studentID is required"],
    },
    teacherID: {
      type: String,
      required: [true, "teacherID required"],
    },
    assessmentID: {
      type: String,
      required: [true, "assessmentID required"],
    },
    contents: {
      type: Object,
    },
    status: {
      type: String,
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const homeWorkSchema = mongoose.model("homeworkSchema", homeWorkModel);

module.exports = homeWorkSchema;
