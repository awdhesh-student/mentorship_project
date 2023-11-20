const mongoose = require("mongoose");

const assessmentModel = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: [true, "User ID is required"],
    },
    type: {
      type: String,
      required: [true, "type is required"],
    },
    title: {
      type: String,
      required: [true, "title is required"],
    },
    description: {
      type: String,
      required: [true, "description is required"],
    },
  },
  {
    timestamps: true,
  }
);

const assessmentSchema = mongoose.model("assessment", assessmentModel);

module.exports = assessmentSchema;
