const express = require("express");
const router = express.Router();
const courseControllers = require("../controllers/courses.controllers");

router.post("/create-courses", courseControllers.createCourseController);
router.get("/", courseControllers.getAllCoursesControllers);
router.get("/:courseId", courseControllers.getEachCourseController);
router.put(
  "/:courseId/what-you-will-learn",
  courseControllers.updateCourseController
);
// router.post("/:courseId/rate", courseControllers.rateCourseController);
module.exports = router;
