const Course = require("../models/courses.model");
const responses = require("../utility/send.response");
const Admin = require("../models/admin.model");

// Endpoint to create a course
const createCourses = async (payload) => {
  const admin = await Admin.findOne({ _id: payload.tutor });

  if (!admin || admin.role !== "1") {
    return responses.failureResponse(
      "Only tutors can create a course. So sorry",
      403
    );
  }
  // to display the tutors name
  const tutorName = `${admin.firstName} ${admin.lastName}`;
  payload.tutorName = tutorName;

  const newCourse = await Course.create(payload);

  return responses.successResponse(
    "The Course has been created successfully",
    201,
    newCourse
  );
};

// Implementing pagination
const getAllCourses = async (query = {}) => {
  try {
    const paginate = {
      page: 1,
      limit: 10,
    };

    if (query.page) {
      paginate.page = Number(query.page);
      delete query.page;
    }

    if (query.limit) {
      paginate.limit = Number(query.limit);
      delete query.limit;
    }

    const courses = await Course.find(query)
      .skip((paginate.page - 1) * paginate.limit)
      .limit(paginate.limit)
      .exec();

    const totalCounts = await Course.countDocuments(query);

    return responses.successResponse("Successfully fetched all courses", 200, {
      data: courses,
      page: paginate.page,
      noPerPage: paginate.limit,
      totalCounts,
    });
  } catch (error) {
    console.error("Error in fetching courses:", error);
    return responses.failureResponse("Failed to fetch all courses", 500);
  }
};

// Endpoint to get a single course
const getEachCourse = async (courseId) => {
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return responses.failureResponse("There is no Course with this ID", 404);
    }

    return responses.successResponse(
      "Course fetched successfully",
      200,
      course
    );
  } catch (error) {
    console.error("Error in fetching course:", error);
    return responses.failureResponse("Failed to fetch course", 500);
  }
};

// Endpoint to update the course
const updateCourse = async (courseId, payload) => {
  try {
    const { whatYouWillLearn } = payload;

    const foundCourse = await Course.findById(courseId);
    if (!foundCourse) {
      return responses.failureResponse("CourseId is invalid", 404);
    }

    const update = {};
    if (whatYouWillLearn) {
      update.whatYouWillLearn = whatYouWillLearn;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $set: update },
      { new: true }
    );

    if (!updatedCourse) {
      return responses.failureResponse("Failed to update course", 500);
    }

    return responses.successResponse(
      "Course updated successfully",
      200,
      updatedCourse
    );
  } catch (error) {
    console.error("An error occurred", error);
    return responses.failureResponse(
      "An error occurred while updating the course",
      500
    );
  }
};

// Endpoint to rate courses
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

// Endpoint to search for a course
const findCourse = async (query) => {
  try {
    console.log("query", query);
    if (!query.search) {
      return responses.failureResponse("Search query is required", 400);
    }

    const searchKeyword = {
      $or: [
        { title: { $regex: query.search, $options: "i" } },
        { tutorName: { $regex: query.search, $options: "i" } },
      ],
    };

    // Pagination to avoid bulk results
    const page = query.page ? parseInt(query.page, 10) : 1;

    const limit = query.limit ? parseInt(query.limit, 10) : 10;

    const skip = (page - 1) * limit;

    // Find the courses based on the search keyword
    const foundCourses = await Course.find(searchKeyword)
      .skip(skip)
      .limit(limit)
      .exec();

    if (foundCourses.length === 0) {
      return responses.failureResponse(
        "Sorry!, No course matches your criteria",
        404
      );
    }

    return responses.successResponse(
      "Here's what you're looking for",
      200,
      foundCourses
    );
  } catch (error) {
    console.error("An error occured", error);
    return responses.failureResponse(
      "An error occured while fetching courses",
      500
    );
  }
};

module.exports = {
  createCourses,
  getAllCourses,
  getEachCourse,
  updateCourse,
  rateCourse,
  findCourse,
};
