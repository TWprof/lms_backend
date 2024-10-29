const express = require("express");
const router = express.Router();
const courseControllers = require("../controllers/courses.controllers");
const authMiddleware = require("../middleware/auth");

// Route to create a course
router.post("/create-courses", courseControllers.createCourseController);

// Route to get all the available courses
router.get("/", courseControllers.getAllCoursesControllers);

// Route to search a course from the available courses
router.get("/search", courseControllers.findCourseController);

// Route to update and publish a course
router.put(
  "/:courseId/publish",
  courseControllers.updateAndPublishCourseController
);
// Route to update a course (What will you learn section)
router.put(
  "/:courseId/what-you-will-learn",
  courseControllers.updateCourseController
);

// Route to rate a course by courseID
router.post(
  "/:courseId/rate",
  authMiddleware.authenticate,
  courseControllers.rateCourseController
);

// Route to get a single course
router.get("/:courseId", courseControllers.getEachCourseController);

// route to view or purchase a course
router.post(
  "/:courseId/action",
  authMiddleware.authenticate,
  courseControllers.viewOrPurchaseCourseController
);

module.exports = router;
