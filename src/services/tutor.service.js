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
    const coursesData = await Course.find({ tutor: tutorId }).lean();

    if (!coursesData || coursesData.length === 0) {
      return responses.failureResponse(
        "There are no courses found for this Tutor",
        404
      );
    }

    // Initialize the variables for the statistics
    let totalEnrolledStudents = 0;
    let totalCourseCreated = coursesData.length;
    let courseEnrolled = [];
    let totalWatchHours = 0;
    let courseRatings = [];
    let totalRevenue = 0;

    const weeklyRevenue = {};
    const monthlyRevenue = {};
    let publishedCourses = 0;
    let unpublishedCourses = 0;

    for (let course of coursesData) {
      const courseId = course._id;

      // Check if the course is published
      if (course.isPublished) {
        publishedCourses++;
      } else {
        unpublishedCourses++;
      }

      // Total students enrolled per course
      const enrolledStudents = (
        await PurchasedCourses.distinct("userId", {
          courseId: courseId,
        })
      ).length;

      totalEnrolledStudents += enrolledStudents;

      // Total purchase per each course
      const enrolledCourses = await PurchasedCourses.countDocuments({
        courseId: courseId,
      });

      courseEnrolled.push({
        courseTitle: course.title,
        totalPurchase: enrolledCourses,
        isPublished: course.isPublished,
      });

      // Total Watch hours/course view
      const courseWatchTime = await PurchasedCourses.aggregate([
        { $match: { courseId: courseId } },
        { $group: { _id: null, totalMinutes: { $sum: "$minutesSpent" } } },
      ]);

      const watchTimeInMinutes =
        courseWatchTime.length > 0 ? courseWatchTime[0].totalMinutes : 0;

      totalWatchHours += watchTimeInMinutes / 60;

      // Track the Course Ratings
      courseRatings.push({ title: course.title, rating: course.rating });

      // Calculate the sales per week and month
      const courseSales = await Payment.aggregate([
        {
          $match: {
            status: "success",
            cartIds: { $in: [courseId.toString()] },
          },
        },
        {
          $group: {
            _id: {
              week: { $week: "$paidAt" },
              month: { $month: "$paidAt" },
              year: { $year: "$paidAt" },
            },
            totalRevenue: { $sum: "$amount" },
          },
        },
      ]);

      // Accumulate the revenue for each week/month
      courseSales.forEach((payment) => {
        const { week, month, year } = payment._id;
        const weekKey = `${year}-W${week}`;
        const monthKey = `${year}-M${month}`;

        weeklyRevenue[weekKey] =
          (weeklyRevenue[weekKey] || 0) + payment.totalRevenue;
        monthlyRevenue[monthKey] =
          (monthlyRevenue[monthKey] || 0) + payment.totalRevenue;

        totalRevenue += payment.totalRevenue;
      });
    }

    // Sort course ratings outside the loop to determine top and least-rated courses
    courseRatings.sort((a, b) => b.rating - a.rating);

    const topRatedCourse = courseRatings.length > 0 ? courseRatings[0] : null;
    const leastRatedCourse =
      courseRatings.length > 0 ? courseRatings[courseRatings.length - 1] : null;

    // Calculate the top-rated and least-rated percentages
    const topRatedPercent = topRatedCourse ? topRatedCourse.rating : 0;
    const leastRatedPercent = leastRatedCourse ? leastRatedCourse.rating : 0;

    return responses.successResponse("Tutor Courses Statistics", 200, {
      totalEnrolledStudents,
      totalCourseCreated,
      totalWatchHours,
      topRatedCourse: topRatedCourse
        ? { title: topRatedCourse.title, rating: topRatedPercent }
        : null,
      leastRatedCourse: leastRatedCourse
        ? { title: leastRatedCourse.title, rating: leastRatedPercent }
        : null,
      totalRevenue,
      weeklyRevenue,
      monthlyRevenue,
      publishedCourses,
      unpublishedCourses,
      courseEnrolled,
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
