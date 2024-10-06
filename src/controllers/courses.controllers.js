const courseServices = require("../services/course.service");

// Create Course controller
const createCourseController = async (req, res) => {
  const data = await courseServices.createCourses(req.body);
  res.status(data.statusCode).json(data);
};

// Update and publish courses controller
const updateAndPublishCourseController = async (req, res) => {
  const { courseId } = req.params;
  const { payload } = req.body;

  if (!payload) {
    return res.status(400).json({ message: "Payload is required" });
  }

  const data = await courseServices.updateAndPublishCourse(courseId, payload);
  res.status(data.statusCode).json(data);
};

// Get all courses Controller
const getAllCoursesControllers = async (req, res) => {
  const data = await courseServices.getAllCourses(req.query);
  res.status(data.statusCode).json(data);
};

// Get A single Course Controller
const getEachCourseController = async (req, res) => {
  const { courseId } = req.params;
  const data = await courseServices.getEachCourse(courseId);
  res.status(data.statusCode).json(data);
};

// Controller to Update Course
const updateCourseController = async (req, res) => {
  const { courseId } = req.params;
  const data = await courseServices.updateCourse(courseId, req.body);
  res.status(data.statusCode).json(data);
};

// Rate Course Controller
const rateCourseController = async (req, res) => {
  const { courseId } = req.params;
  const { newRating } = req.body;

  const data = await courseServices.rateCourse(courseId, newRating);
  res.status(data.statusCode).json(data);
};

// Search Course controller
const findCourseController = async (req, res) => {
  console.log("Query parameters received:", req.query);
  const data = await courseServices.findCourse(req.query);
  res.status(data.statusCode).json(data);
};

module.exports = {
  createCourseController,
  updateAndPublishCourseController,
  getAllCoursesControllers,
  getEachCourseController,
  updateCourseController,
  rateCourseController,
  findCourseController,
};
