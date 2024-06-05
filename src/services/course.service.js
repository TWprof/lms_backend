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

// Implementing pagination
const getAllCourses = async (query = {}) => {
  console.log(query);

  try {
    const paginate = {
      page: 0,
      limit: 10,
    };

    if (query.page) {
      paginate.page = query.page;
      delete query.page;
    }

    if (query.limit) {
      paginate.limit = query.limit;
      delete query.limit;
    }

    console.log({ query });

    const courses = await Course.find(query)
      .skip(paginate.page - 1)
      .limit(paginate.limit)
      .exec();

    console.log(courses);

    const totalCounts = await Course.countDocuments(query);

    return responses.successResponse("Successfully fetched all courses", 200, {
      data: courses,
      page: Number(paginate.page),
      noPerPage: Number(paginate.limit),
      totalCounts,
    });
  } catch (error) {
    return responses.failureResponse("Failed to fetch all courses", 500);
  }
};

const rateCourse = async (courseId, newRating) => {
  if (newRating < 1 || newRating > 5) {
    return responses.failureResponse("Rating must be between 1 and 5", 400);
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return responses.failureResponse("Course not found", 404);
  }

  const currentRating = course.rating;
  course.rating = (currentRating + parseFloat(newRating)) / 2;
  await course.save();
  return responses.successResponse(
    "Course rating updated successflly",
    200,
    course
  );
};
module.exports = {
  createCourses,
  getAllCourses,
  rateCourse,
};
