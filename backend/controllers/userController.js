const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const userSchema = require("../schemas/userModel");
const assessmentSchema = require("../schemas/assessmentModel");
const assignedSchema = require("../schemas/assignedModel");
const homeWorkSchema = require("../schemas/homeWorkModel");

//////////for registering/////////////////////////////
const registerController = async (req, res) => {
  try {
    const existsUser = await userSchema.findOne({ email: req.body.email });
    if (existsUser) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;

    const newUser = new userSchema(req.body);
    await newUser.save();

    return res.status(201).send({ message: "Register Success", success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: `${error.message}` });
  }
};

////for the login////////////////////////////////////
const loginController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invalid email or password", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
      expiresIn: "1d",
    });
    user.password = undefined;
    return res.status(200).send({
      message: "Login success successfully",
      success: true,
      token,
      userData: user,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: `${error.message}` });
  }
};

////for the adding assessment/homework///////////////////////////////////
const addAssessmentController = async (req, res) => {
  try {
    const assessment = new assessmentSchema(req.body);
    if (!assessment) {
      return res.status(403).send({
        success: false,
        message: "No data provided",
      });
    } else {
      await assessment.save();
      return res.status(200).send({
        success: true,
        message: "Assessment has been stored!!",
      });
    }
  } catch (error) {
    console.log("Error in saving assessment");
    return res.status(500).send({
      success: false,
      message: `Error in saving Assessment ${error}`,
    });
  }
};

/////////sending assessment for particular teacher
const sendingAssessmentController = async (req, res) => {
  try {
    const allAssessments = await assessmentSchema.find();
    const assessments = allAssessments.filter(
      (assessment) => assessment.userId.toString() === req.body.userId
    );

    const userStudents = await userSchema.find({
      type: "Student",
    });

    const studentsObjects = {
      studentIDs: userStudents.map((student) => student._id),
      studentNames: userStudents.map((student) => student.name),
    };

    return res.status(200).send({
      success: true,
      results: {
        students: studentsObjects,
        assessments: assessments,
      },
    });
  } catch (error) {
    console.log("Error in saving assessment");
    return res.status(500).send({
      success: false,
      message: `Error in saving Assessment ${error}`,
    });
  }
};

////for the notification
const getallnotificationController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    const seennotification = user.seennotification;
    const notification = user.notification;

    seennotification.push(...notification);
    user.notification = [];
    user.seennotification = seennotification;

    const updatedUser = await user.save();
    return res.status(200).send({
      success: true,
      message: "All notification marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "unable to fetch", success: false, error });
  }
};

////for deleting the notification
const deleteallnotificationController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    user.notification = [];
    user.seennotification = [];

    const updatedUser = await user.save();
    updatedUser.password = undefined;
    return res.status(200).send({
      success: true,
      message: "notification deleted",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "unable to delete", success: false, error });
  }
};

//////assigning assessment to student
const assigningAssessmentController = async (req, res) => {
  const { assessmentId } = req.params;
  const { userId, studentID } = req.body;

  try {
    // Creating a new instance of assignedSchema
    const assignedData = new assignedSchema({
      studentID,
      teacherID: userId,
      assessmentID: assessmentId,
    });

    const teacherUser = await userSchema.findOne({
      _id: userId,
    });

    const studentUser = await userSchema.findOne({
      _id: studentID,
    });

    if (studentUser) {
      studentUser.notification.push({
        type: "Assessment assigned",
        message: `Assessment assigned from ${teacherUser.name}`,
      });
      await studentUser.save();
    } else {
      return res.status(404).send({
        success: false,
        message: "Student not found.",
      });
    }

    // Saving the created instance to the database
    await assignedData.save();

    // Send a success response
    return res.status(200).send({
      success: true,
      message: `Assessment assigned successfully to ${studentUser.name}`,
    });
  } catch (error) {
    // Log the specific error details
    console.error("Error in saving assessment:", error);

    // Send an error response with a more informative message
    return res.status(500).send({
      success: false,
      message: `Error in saving Assessment: ${error.message}`,
    });
  }
};

/////assigned assessment by individual teacher
const getAllAssignedAssessmentController = async (req, res) => {
  const { userId } = req.body;
  try {
    const allAssignedAssessment = await assignedSchema.find({
      teacherID: userId,
    });
    return res.status(200).send({
      success: true,
      results: allAssignedAssessment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "An error occurred" });
  }
};

/////assigned assessment by individual student
const getAllAssignedAssessmentStudentController = async (req, res) => {
  const { userId } = req.body;
  try {
    const allAssignedAssessment = await assignedSchema.find({
      studentID: userId,
    });

    const assessmentDetailsPromises = allAssignedAssessment.map(
      async (assignedAssessment) => {
        const assessment = await assessmentSchema.findOne({
          _id: assignedAssessment.assessmentID,
        });
        return {
          assignedAssessment,
          assessmentDetails: assessment,
        };
      }
    );

    const results = await Promise.all(assessmentDetailsPromises);

    return res.status(200).send({
      success: true,
      results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "An error occurred" });
  }
};

//////////////answer to the assements by student
const assignedAssessmentAnswerController = async (req, res) => {
  const { assessmentId, assignedId } = req.params;
  const { userId, para } = req.body;

  try {
    const assessment = await assessmentSchema.findOne({
      _id: assessmentId,
    });

    // Use findOne instead of find to get a single document
    const assignedDetails = await assignedSchema.findOne({
      _id: assignedId,
    });

    if (!assignedDetails) {
      return res.status(404).send({ error: "Assigned assessment not found" });
    }

    if (req.file) {
      // Update the contents field with the file details
      assignedDetails.contents = {
        file: {
          filename: req.file.filename,
          path: `/uploads/${req.file.filename}`,
        },
        content: para,
      };
    }

    // Update the status to 'completed'
    assignedDetails.status = "completed";

    const teacher = await userSchema.findOne({
      _id: assignedDetails.teacherID,
    });

    const notification = teacher.notification;
    notification.push({
      message: `${assignedDetails.studentID} has added some contents to the assessment whose ID is ${assignedDetails.assessmentID}`,
    });

    // Assign the updated notification array back to teacher

    // Save the changes
    await assignedDetails.save();
    await userSchema.findByIdAndUpdate(teacher._id, { notification });

    res
      .status(200)
      .send({ success: true, message: "Contents updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "An error occurred" });
  }
};

//////////file download from teacher
const fileDownloadController = async (req, res) => {
  const assessmentId = req.query.assessmentId;
  try {
    const assignedAssessment = await assignedSchema.findById(assessmentId);

    if (!assignedAssessment) {
      return res.status(404).send({ message: "Assessment not found" });
    }

    // Assuming that the document URL is stored in the "document" field of the appointment
    const fileUrl = assignedAssessment.contents?.file?.path; // Use optional chaining to safely access the property

    if (!fileUrl || typeof fileUrl !== "string") {
      return res
        .status(404)
        .send({ message: "file URL is invalid", success: false });
    }

    // Construct the absolute file path
    const absoluteFilePath = path.join(__dirname, "..", fileUrl);

    // Check if the file exists before initiating the download
    fs.access(absoluteFilePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res
          .status(404)
          .send({ message: "File not found", success: false, error: err });
      }

      // Set appropriate headers for the download response
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(absoluteFilePath)}"`
      );
      res.setHeader("Content-Type", "application/octet-stream");

      // Stream the file data to the response
      const fileStream = fs.createReadStream(absoluteFilePath);
      fileStream.on("error", (error) => {
        console.log(error);
        return res.status(500).send({
          message: "Error reading the document",
          success: false,
          error: error,
        });
      });
      // Pipe the fileStream to the response
      fileStream.pipe(res);

      // Send the response after the file stream ends (file download is completed)
      fileStream.on("end", () => {
        res.end();
      });
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "Something went wrong", success: false });
  }
};

/////////submit marks from teacher
const attachingMarksController = async (req, res) => {
  const { assessmentId } = req.params;
  try {
    const assignedAssessment = await assignedSchema.findByIdAndUpdate(
      { _id: assessmentId },
      {
        $inc: {
          Marks: req.body.marks,
        },
      },
      { new: true }
    );

    if (!assignedAssessment) {
      return res.status(404).json({
        success: false,
        error: "No Assignment Found!",
      });
    }

    const student = await userSchema.findOne({
      _id: assignedAssessment.studentID,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found!",
      });
    }

    const notification = student.notification || [];
    notification.push({
      message: `Marks added successfully to your assessment ${assignedAssessment.assessmentID}`,
    });

    await userSchema.findByIdAndUpdate(student._id, { notification });

    return res.json({
      success: true,
      message: "Marks submitted successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "An error occurred",
    });
  }
};

////////////send homework to the student////////
const sendHomeWorkController = async (req, res) => {
  try {
    const allHomeWork = await assessmentSchema.find({ type: "Home Work" });

    if (allHomeWork.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No Homework available",
      });
    }

    const homeWorkIDs = allHomeWork.map((homework) => homework._id);
    const statusHomeWorkID = await homeWorkSchema.find({
      assessmentID: { $in: homeWorkIDs },
    });

    return res.status(200).json({
      success: true,
      data: {
        allHomeWork,
        statusHomeWorkID,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "An error occurred",
    });
  }
};

///////homework content by student////////
const homeWorkContentController = async (req, res) => {
  const { homeworkId } = req.params;
  const { userId, para } = req.body;

  try {
    const homeWork = await assessmentSchema.findOne({ _id: homeworkId });

    let contents = {
      studentID: userId,
      teacherID: homeWork.userId,
      assessmentID: homeworkId,
      contents: {},
      status: "completed",
    };

    if (req.file) {
      contents.contents.file = {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
      };
      contents.contents.content = para;
    }

    const homeworkContent = new homeWorkSchema(contents);

    const teacher = await userSchema.findOne({ _id: homeWork.userId });

    const notification = teacher.notification || [];
    notification.push({
      message: `${userId} has added some contents to the assessment whose ID is ${homeworkId}`,
    });

    // Save the updated notification back to the teacher
    await userSchema.findByIdAndUpdate(teacher._id, { notification });

    // Save the homework content
    await homeworkContent.save();

    res
      .status(200)
      .send({ success: true, message: "Contents updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "An error occurred" });
  }
};

module.exports = {
  registerController,
  loginController,
  addAssessmentController,
  sendingAssessmentController,
  getallnotificationController,
  deleteallnotificationController,
  assigningAssessmentController,
  getAllAssignedAssessmentController,
  getAllAssignedAssessmentStudentController,
  assignedAssessmentAnswerController,
  fileDownloadController,
  attachingMarksController,
  sendHomeWorkController,
  homeWorkContentController,
};
