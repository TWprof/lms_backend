const courseServices = require("../services/course.service");

const createCourseController = async (req, res) => {
  const data = await courseServices.createCourses(req.body);
  res.status(data.statusCode).json(data);
};

const getAllCoursesControllers = async (req, res) => {
  const data = await courseServices.getAllCourses(req.query);
  res.status(data.statusCode).json(data);
};

const getEachCourseController = async (req, res) => {
  const { courseId } = req.params;
  const data = await courseServices.getEachCourse(courseId);
  res.status(data.statusCode).json(data);
};

const updateCourseController = async (req, res) => {
  const { courseId } = req.params;
  const data = await courseServices.updateCourse(courseId, req.body);
  res.status(data.statusCode).json(data);
};

const rateCourseController = async (req, res) => {
  const data = await courseServices.rateCourse(req.body);
  res.status(data.statusCode).json(data);
};

module.exports = {
  createCourseController,
  getAllCoursesControllers,
  getEachCourseController,
  updateCourseController,
  rateCourseController,
};
