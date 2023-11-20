const express = require("express");
const multer = require("multer");

const authMiddleware = require("../middlewares/authMiddleware");
const {
  registerController,
  loginController,
  addAssessmentController,
  getallnotificationController,
  deleteallnotificationController,
  assigningAssessmentController,
  getAllAssignedAssessmentController,
  sendingAssessmentController,
  getAllAssignedAssessmentStudentController,
  assignedAssessmentAnswerController,
  fileDownloadController,
  attachingMarksController,
  sendHomeWorkController,
  homeWorkContentController,
} = require("../controllers/userController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/teacher/addassessment", authMiddleware, addAssessmentController);

router.post(
  "/getallnotification",
  authMiddleware,
  getallnotificationController
);

router.post(
  "/deleteallnotification",
  authMiddleware,
  deleteallnotificationController
);

router.get(
  "/teacher/allassessment",
  authMiddleware,
  sendingAssessmentController
);

router.post(
  "/teacher/assignassessment/:assessmentId",
  authMiddleware,
  assigningAssessmentController
);

router.get(
  "/teacher/getallassignedassessment",
  authMiddleware,
  getAllAssignedAssessmentController
);

router.get(
  "/student/getallassignedassessment",
  authMiddleware,
  getAllAssignedAssessmentStudentController
);

router.post(
  "/student/submitanswer/:assessmentId/:assignedId",
  upload.single("file"),
  authMiddleware,
  assignedAssessmentAnswerController
);

router.get("/teacher/getfiledownload", authMiddleware, fileDownloadController);

router.post(
  "/teacher/settingmarks/:assessmentId",
  authMiddleware,
  attachingMarksController
);

router.get("/student/allhomeworktasks", authMiddleware, sendHomeWorkController);

router.post(
  "/student/submithomework/:homeworkId",
  upload.single("file"),
  authMiddleware,
  homeWorkContentController
);

module.exports = router;
