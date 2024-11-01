const Course = require("../models/courses.model");
const Payment = require("../models/payment.model");
const PurchasedCourses = require("../models/purchasedCourse.model");
const Review = require("../models/reviews.model");
const responses = require("../utility/send.response");
const User = require("../models/user.model");

// Tutor overview statistics
const tutorOverview = async (tutorId, timePeriod) => {
  try {
    // Calculate startDate and endDate based on the time period
    let startDate, endDate;
    const currentDate = new Date();

    if (!timePeriod) {
      // Default to previous month
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      );
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    } else {
      switch (timePeriod) {
        case "week":
          startDate = new Date(
            currentDate.setDate(currentDate.getDate() - currentDate.getDay())
          );
          endDate = new Date(currentDate.setDate(startDate.getDate() + 6));
          break;
        case "month":
          startDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          );
          endDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
          );
          break;
        case "year":
          startDate = new Date(currentDate.getFullYear(), 0, 1);
          endDate = new Date(currentDate.getFullYear(), 11, 31);
          break;
        default:
          return responses.failureResponse("Invalid time period", 400);
      }
    }

    const dateFilter = { $gte: startDate, $lte: endDate };
    console.log("start date", startDate);
    console.log("end date", endDate);
    // Find all courses by the tutor
    const courses = await Course.find({ tutor: tutorId }).select(
      "_id title rating views reviewCount"
    );

    if (!courses || courses.length === 0) {
      return responses.failureResponse("No courses found for the tutor", 404);
    }

    const tutorCourseIds = courses.map((course) => course._id);

    // Apply date filter for enrolled courses
    const enrolledCourses = await PurchasedCourses.countDocuments({
      courseId: { $in: tutorCourseIds },
      createdAt: dateFilter,
    });
    console.log("Enrolled Courses Count:", enrolledCourses);
    // Apply date filter for enrolled students
    const enrolledStudents = (
      await PurchasedCourses.distinct("userId", {
        courseId: { $in: tutorCourseIds },
        createdAt: dateFilter,
      })
    ).length;
    console.log("Enrolled Students Count:", enrolledStudents);
    // Apply date filter for certificates acknowledged
    const certificates = await PurchasedCourses.countDocuments({
      courseId: { $in: tutorCourseIds },
      isCompleted: 1,
      createdAt: dateFilter,
    });

    // Apply date filter for total amount
    const totalAmount = await Payment.aggregate([
      {
        $match: {
          status: "success",
          cartIds: {
            $elemMatch: { $in: tutorCourseIds.map((id) => id.toString()) },
          },
          createdAt: dateFilter,
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalAmountValue = totalAmount.length > 0 ? totalAmount[0].total : 0;

    // Apply date filter for recent reviews
    const recentReviews = await Review.find({
      courseId: { $in: tutorCourseIds },
      createdAt: dateFilter,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("courseId", "title")
      .populate("userId", "firstName lastName")
      .select("rating reviewText");

    // Most Rated Course (not filtered by date, as ratings are accumulated over time)
    const mostRatedCourse = await Review.aggregate([
      {
        $group: {
          _id: "$courseId",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
      { $sort: { averageRating: -1 } },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "courseInfo",
        },
      },
      { $unwind: "$courseInfo" },
      {
        $project: {
          courseTitle: "$courseInfo.title",
          averageRating: 1,
          reviewCount: 1,
        },
      },
      { $limit: 1 },
    ]);

    const mostRated = mostRatedCourse.length > 0 ? mostRatedCourse[0] : null;

    // Performance metrics (apply date filtering where applicable)
    const retentionRate =
      enrolledStudents > 0 ? (certificates / enrolledCourses) * 100 : 0;
    const completionRate =
      enrolledStudents > 0 ? (certificates / enrolledCourses) * 100 : 0;

    const totalFeedbackCount = courses.reduce(
      (sum, course) => sum + course.reviewCount,
      0
    );

    const totalFeedbackScore = courses.reduce(
      (sum, course) => sum + course.rating * course.reviewCount,
      0
    );
    const feedbackRate =
      totalFeedbackCount > 0 ? totalFeedbackScore / totalFeedbackCount : 0;

    const performanceScore =
      retentionRate * 0.4 + completionRate * 0.4 + feedbackRate * 0.2;

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
        reviewCount: course.reviewCount,
      })),
      mostRatedCourse: mostRated,
      recentReviews: recentReviews.map((review) => ({
        courseTitle: review.courseId.title,
        reviewerName: `${review.userId.firstName} ${review.userId.lastName}`,
        rating: review.rating,
        reviewText: review.reviewText,
      })),
      performanceChart: {
        retentionRate,
        completionRate,
        feedbackRate,
        performanceScore,
      },
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
        $group: {
          _id: "$userId",
          userInfo: { $first: "$userDetails" },
          coursesPurchased: {
            $push: {
              courseId: "$courseDetails._id",
              title: "$courseDetails.title",
              price: "$courseDetails.price",
              purchaseDate: "$purchaseDate",
            },
          },
        },
      },
      {
        $project: {
          "userInfo.firstName": 1,
          "userInfo.lastName": 1,
          "userInfo.email": 1,
          coursesPurchased: 1,
        },
      },
    ]);

    // to calculate the new students that purchase a course every month
    const today = new Date();

    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

    // New students from last 30 days
    const newStudents = studentDetails.filter((student) =>
      student.coursesPurchased.some(
        (course) => course.purchaseDate >= thirtyDaysAgo
      )
    );

    // to calculate the student retention percentage
    const totalCompletion = await PurchasedCourses.countDocuments({
      courseId: { $in: tutorCourseIds },
      isCompleted: true,
    });
    const retentionPercentage = (totalCompletion / studentDetails.length) * 100;

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

    const totalAmountValue = totalAmount.length > 0 ? totalAmount[0].total : 0;

    if (!studentDetails.length) {
      return responses.failureResponse("No student details found", 404);
    }

    return responses.successResponse("Tutor student statistics", 200, {
      totalStudents: studentDetails.length,
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

const backfillTimestamps = async () => {
  try {
    // Update payments missing `createdAt`
    const paymentsUpdate = await Payment.updateMany(
      { createdAt: new Date("2024-01-01T00:00:00Z") },
      [
        {
          $set: {
            createdAt: {
              $ifNull: ["$date", new Date("2024-01-01T00:00:00Z")], // Use `date` field if available
            },
          },
        },
      ]
    );

    console.log("Payments updated:", paymentsUpdate.modifiedCount);

    // Update purchased courses missing `createdAt`
    const purchasedCoursesUpdate = await PurchasedCourses.updateMany(
      { createdAt: new Date("2024-01-01T00:00:00Z") },
      [
        {
          $set: {
            createdAt: {
              $ifNull: ["$purchaseDate", new Date("2024-01-01T00:00:00Z")], // Replace with estimated default date
            },
          },
        },
      ]
    );

    console.log(
      "Purchased Courses updated:",
      purchasedCoursesUpdate.modifiedCount
    );

    console.log("Timestamp backfill completed successfully.");
  } catch (error) {
    console.error("Error updating timestamps:", error);
  } finally {
    // mongoose.connection.close();
  }
};

backfillTimestamps();
module.exports = {
  tutorOverview,
  tutorMyCourses,
  tutorStudents,
  tutorTransactions,
};
