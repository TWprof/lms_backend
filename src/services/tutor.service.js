const Course = require("../models/courses.model");
const Payment = require("../models/payment.model");
const PurchasedCourses = require("../models/purchasedCourse.model");
const responses = require("../utility/send.response");

// Tutor overview statistics
const tutorOverview = async (tutorId) => {
  try {
    // Find all courses by the tutor
    const courses = await Course.find({ tutor: tutorId }).select("_id");

    if (!courses || courses.length === 0) {
      return responses.failureResponse("No courses found for the tutor", 404);
    }

    const tutorCourseIds = courses.map((course) => course._id);
    console.log("Tutor Course IDs:", tutorCourseIds);

    // Courses purchased/enrolled
    const enrolledCourses = await PurchasedCourses.countDocuments({
      courseId: { $in: tutorCourseIds },
    });

    // Students who purchased
    const enrolledStudents = (
      await PurchasedCourses.distinct("userId", {
        courseId: { $in: tutorCourseIds },
      })
    ).length;

    // Certificates acknowledged
    const certificates = await PurchasedCourses.countDocuments({
      courseId: { $in: tutorCourseIds },
      isCompleted: 1,
    });

    const matchingPayments = await Payment.find({
      status: "success",
      cartIds: {
        $elemMatch: { $in: tutorCourseIds.map((id) => id.toString()) },
      },
    });

    console.log("Matching Payments:", matchingPayments);

    // Total amount
    const totalAmount = await Payment.aggregate([
      {
        $match: {
          status: "success",
          cartIds: {
            $elemMatch: { $in: tutorCourseIds.map((id) => id.toString()) },
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    console.log("Total Amount Aggregate Result:", totalAmount);

    const totalAmountValue = totalAmount.length > 0 ? totalAmount[0].total : 0;

    return responses.successResponse("Tutor overview statistics", 200, {
      enrolledCourses,
      enrolledStudents,
      certificates,
      totalAmount: totalAmountValue,
    });
  } catch (error) {
    console.error("There was an error", error);
    return responses.failureResponse(
      "There was an error fetching the Tutor Overview statistics",
      500
    );
  }
};

const tutorMyCourses = async (tutorId) => {
  try {
    // find all the courses created by the tutor
    const coursesData = await Course.aggregate([
      { $match: { tutor: tutorId } },
      {
        $lookup: {
          from: "purchasedcourses",
          localField: "_id",
          foreignField: "courseId",
          as: "purchases",
        },
      },
      {
        $lookup: {
          from: "payment",
          localField: "_id",
          foreignField: "cartIds",
          as: "payments",
        },
      },
      {
        $addFields: {
          studentsEnrolled: { $size: "$purchases" },
          certificatesCompleted: {
            $size: {
              $filter: {
                input: "$purchases",
                as: "purchase",
                cond: { $eq: ["$$purchase.isCompleted", true] },
              },
            },
          },
          totalWatchTime: {
            $sum: "$purchases.minutesSpent",
          },
          totalAmount: { $sum: "$payments.amount" },
        },
      },
      {
        $group: {
          _id: null,
          topRatedCourse: { $first: "$$ROOT" },
          leastRatedCourse: { $last: "$$ROOT" },
          totalStudentEnrolled: { $sum: "$studentsEnrolled" },
          totalAmountEarned: { $sum: "$totalAmount" },
          totalWatchTime: { $sum: "$totalWatchTime" },
          totalCoursesCreated: { $sum: 1 },
          courseStatistics: {
            $push: {
              courseTitle: "$title",
              rating: "$rating",
              studentsEnrolled: "$studentsEnrolled",
              totalWatchTime: "$totalWatchTime",
              totalAmount: "$totalAmount",
            },
          },
        },
      },
      { $sort: { rating: -1 } },
    ]);

    if (!coursesData || coursesData.length === 0) {
      return responses.failureResponse(
        "There are no courses found for this Tutor",
        404
      );
    }

    const result = coursesData[0];
    return responses.successResponse("Tutor Courses Statistics", 200, {
      topRatedCourse: result.topRatedCourse.title,
      leastRatedCourse: result.leastRatedCourse.title,
      totalWatchTime: result.totalWatchTime,
      totalCoursesCreated: result.totalCoursesCreated,
      totalStudentsEnrolled: result.totalStudentsEnrolled,
      totalAmountEarned: result.totalAmountEarned,
      courseStatistics: result.courseStatistics,
    });
  } catch (error) {
    console.error("There was an error ", error);
    return responses.failureResponse(
      "There was an error fetching the Tutor courses",
      500
    );
  }
};

module.exports = {
  tutorOverview,
  tutorMyCourses,
};
