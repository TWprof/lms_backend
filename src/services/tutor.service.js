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

module.exports = {
  tutorOverview,
};
