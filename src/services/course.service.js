const Course = require("../models/courses.model");
const responses = require("../utility/send.response");
const Admin = require("../models/admin.model");

const createCourses = async (payload) => {
  const admin = await Admin.findOne({ _id: payload.tutor });
  if (!admin || admin.role !== "1") {
    return responses.failureResponse(
      "Only tutors can create a course. So sorry",
      403
    );
  }

  const newCourse = await Course.create(payload);
  return responses.successResponse(
    "The Course has been created successfully",
    201,
    newCourse
  );
};

const courseList = async () => {
  const courses = await Course.find({});
  if (!courses) {
    return responses.failureResponse(
      "There was a problem getting all courses.",
      400
    );
  }
  const allCourses = courses.length;
  return responses.successResponse("Request Successful", 200, allCourses);
};

module.exports = {
  createCourses,
  courseList,
};
