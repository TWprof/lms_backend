const express = require("express");
const router = express.Router();
const courseControllers = require("../controllers/courses.controllers");

router.post("/create-courses", courseControllers.createCourseController);
router.get("/", courseControllers.getAllCoursesControllers);
module.exports = router;
