const Course = require("../models/courses.model");
const Payment = require("../models/payment.model");
const PurchasedCourses = require("../models/purchasedCourse.model");
const Review = require("../models/reviews.model");
const responses = require("../utility/send.response");
const User = require("../models/user.model");

// Tutor overview statistics
const tutorOverview = async (tutorId) => {
  try {
    // Find all courses by the tutor
    const courses = await Course.find({ tutor: tutorId }).select(
      "_id title rating views"
    );

    if (!courses || courses.length === 0) {
      return responses.failureResponse("No courses found for the tutor", 404);
    }

    const tutorCourseIds = courses.map((course) => course._id);

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

    const totalAmountValue = totalAmount.length > 0 ? totalAmount[0].total : 0;

    // to get the Recent Reviews
    const recentReviews = await Review.find({
      courseId: { $in: tutorCourseIds },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("courseId", "title")
      .populate("userId", "firstName lastName")
      .select("rating reviewText");

    // Most Rated Course
    const mostRatedCourse = await Review.aggregate([
      {
        $group: {
          _id: "$courseId",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
      {
        $sort: { averageRating: -1 },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "courseInfo",
        },
      },
      {
        $unwind: "$courseInfo",
      },
      {
        $project: {
          courseTitle: "$courseInfo.title",
          averageRating: 1,
          reviewCount: 1,
        },
      },
      {
        $limit: 1,
      },
    ]);

    const mostRated = mostRatedCourse.length > 0 ? mostRatedCourse[0] : null;

    return responses.successResponse("Tutor overview statistics", 200, {
      quickStats: {
        enrolledCourses,
        enrolledStudents,
        certificates,
        totalAmount: totalAmountValue,
      },
      courseStatistics: courses.map((course) => ({
        title: course.title,
        enrolled: enrolledStudents,
        views: course.views,
      })),
      mostRatedCourse: mostRated,
      recentReviews: recentReviews.map((review) => ({
        courseTitle: review.courseId.title,
        reviewerName: `${review.userId.firstName} ${review.userId.lastName}`,
        rating: review.rating,
        reviewText: review.reviewText,
      })),
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
      coursesData,
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

const tutorStudents = async (tutorId) => {
  try {
    // first get the courses by that tutor
    const courses = await Course.find({ tutor: tutorId }).select("_id");

    if (!courses || courses.length === 0) {
      return responses.failureResponse(
        "There are no courses found for this tutor",
        404
      );
    }

    const tutorCourseIds = courses.map((course) => course._id);

    // to find the total number of students
    const totalStudents = await PurchasedCourses.distinct("userId", {
      courseId: { $in: tutorCourseIds },
    });

    // to calculate the new students that purchase a course every month
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
    const newStudents = await PurchasedCourses.distinct("userId", {
      courseId: { $in: tutorCourseIds },
      purchaseDate: { $gte: thirtyDaysAgo },
    });

    // to calculate the student retention percentage
    const totalCompletion = await PurchasedCourses.countDocuments({
      courseId: { $in: tutorCourseIds },
      isCompleted: true,
    });
    const retentionPercentage = (totalCompletion / totalStudents.length) * 100;

    // Calculate the total revenue
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

    // student Transaction Details
    const studentDetails = await PurchasedCourses.aggregate([
      {
        $match: {
          courseId: { $in: tutorCourseIds },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "courseDetails",
        },
      },
      {
        $unwind: "$courseDetails",
      },
      {
        $lookup: {
          from: "payments",
          localField: "userId",
          foreignField: "userId",
          as: "paymentDetails",
        },
      },
      {
        $unwind: { path: "$paymentDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 0,
          "userDetails.firstName": 1,
          "userDetails.lastName": 1,
          "userDetails.email": 1,
          "paymentDetails.amount": 1,
          "paymentDetails.status": 1,
          "courseDetails.title": 1,
          "courseDetails.price": 1,
        },
      },
    ]);

    if (!studentDetails.length) {
      return responses.failureResponse("No student details found", 404);
    }

    return responses.successResponse("Tutor student statistics", 200, {
      totalStudents: totalStudents.length,
      newStudents: newStudents.length,
      retentionPercentage,
      totalAmount: totalAmountValue,
      studentDetails,
    });
  } catch (error) {
    console.error("There was an error ", error);
    return responses.failureResponse(
      "There was an error getting this information",
      500
    );
  }
};

const tutorTransactions = async (tutorId) => {
  try {
    // find the courses by the tutor from the id
    const courses = await Course.find({ tutor: tutorId });

    // get the course ids
    const courseIds = courses.map((course) => course._id);

    // fetch the payment from each course
    const payments = await Payment.find({
      cartIds: { $in: courseIds },
      status: "success",
    })
      .populate({
        path: "userId",
        select: "firstName lastName",
        model: "User",
      })
      .populate({
        path: "cartIds",
        select: "title",
        model: "Course",
      });

    // initialize the statistics
    let totalIncome = 0;
    let totalCharges = 0;
    let transactionHistory = [];

    payments.forEach((payment) => {
      totalIncome += payment.amount;

      // platform charge
      const charge = payment.amount * 0.1; // 10% charge
      totalCharges += charge;

      // To get the course name and user details
      const userDetails = payment.userId
        ? `${payment.userId.firstName || "N/A"} ${
            payment.userId.lastName || "N/A"
          }`
        : "Unknown User";

      // Get the course titles purchased in each payment
      const courseTitle = payment.cartIds
        .map((course) => course.title)
        .join(",");

      transactionHistory.push({
        email: payment.email,
        amount: payment.amount,
        date: payment.paidAt,
        reference: payment.reference,
        courses: courseTitle,
        studentName: userDetails,
      });
    });

    // To calculate the net income
    const netIncome = totalIncome - totalCharges;
    return responses.successResponse("Tutor Transaction details", 200, {
      transactionHistory,
      totalIncome,
      totalCharges,
      netIncome,
    });
  } catch (error) {
    console.error("There was an error", error);
    return responses.failureResponse("Error fetching tutors Transactions", 500);
  }
};

module.exports = {
  tutorOverview,
  tutorMyCourses,
  tutorStudents,
  tutorTransactions,
};
