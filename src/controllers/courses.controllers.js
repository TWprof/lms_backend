const courseServices = require("../services/course.service");

const createCourseController = async (req, res) => {
  const data = await courseServices.createCourses(req.body);
  res.status(data.statusCode).json(data);
};

const getAllCoursesControllers = async (_req, res) => {
  const data = await courseServices.courseList();
  res.status(data.statusCode).json(data);
};

module.exports = {
  createCourseController,
  getAllCoursesControllers,
};
