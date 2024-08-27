const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const responses = require("../utility/send.response");
const generateResetPin = require("../utility/auth/generateOTP");
const sendMail = require("../utility/mails/index");
const constants = require("../constants");
const PurchasedCourse = require("../models/purchasedCourse.model");
const Course = require("../models/courses.model");
const crypto = require("crypto");

// User Authentication
//Student signup
const userSignUp = async (payload) => {
  const foundUser = await User.findOne({ email: payload.email });
  if (foundUser) {
    return responses.failureResponse("Email already exists", 400);
  }
  payload.password = await bcrypt.hash(payload.password, 10);
  payload.verificationToken = crypto.randomBytes(32).toString("hex");
  payload.verificationTokenExpires = new Date(Date.now() + 3600000);
  await User.create(payload);
  const message = `
  <h1>Email Verification</h1>
            <p>Thank you for registering. Please confirm your email by clicking this link:</p>
            <a href="${process.env.HOST}verify-email?verificationToken=${payload.verificationToken}">Verify your account</a>
  `;
  const emailPayload = {
    to: payload.email,
    subject: "VERIFY YOUR EMAIL",
    message: message,
  };
  // send email by calling sendMail function
  await sendMail(emailPayload, constants.mailTypes.verifyEmail);
  const data = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
  };
  return responses.successResponse("Registeration successful", 201, data);
};

// Email Verification
const verifySignUp = async (verificationToken) => {
  const user = await User.findOne({
    verificationToken,
    verificationTokenExpires: { $gt: new Date() },
  });
  if (!user) {
    return responses.failureResponse("Invalid or Token Expired.", 400);
  }
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();
  return responses.successResponse(
    "Email verified successfully! Proceed to login",
    200
  );
};

// Student Login
const userLogin = async (payload) => {
  const foundUser = await User.findOne({ email: payload.email });

  if (!foundUser) {
    return responses.failureResponse("User details incorrect", 404);
  }

  if (foundUser.isVerified !== true) {
    return responses.failureResponse(
      "Only verified users can login. Please verify your email",
      400
    );
  }

  const userPassword = await bcrypt.compare(
    payload.password,
    foundUser.password
  );

  if (!userPassword) {
    return responses.failureResponse("Invalid password", 400);
  }

  const returnData = {
    _id: foundUser._id,
    email: foundUser.email,
    isVerified: foundUser.isVerified,
    firstName: foundUser.firstName,
  };

  const authToken = jwt.sign(
    {
      email: foundUser.email,
      _id: foundUser._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );

  return responses.successResponse("Login successful", 200, {
    returnData,
    authToken,
  });
};

//Password Recovery
const forgotPassword = async (payload) => {
  try {
    const emailFound = await User.findOne({ email: payload.email });

    if (!payload || !payload.email) {
      return responses.failureResponse(
        "This field cannot be empty. Please input your email",
        400
      );
    }

    if (!emailFound) {
      return responses.failureResponse(
        "Incorrect email! Please check and try again",
        400
      );
    }

    const resetPin = generateResetPin();

    const resetPinExpires = new Date(Date.now() + 600000);

    const updateUser = await User.findByIdAndUpdate(
      { _id: emailFound._id },
      { resetPin: resetPin },
      { resetPinExpires: resetPinExpires },
      { new: true }
    );

    const message = `Please use this pin to reset your password ${resetPin}`;

    const forgotPasswordPayload = {
      to: updateUser.email,
      subject: "RESET PASSWORD",
      pin: resetPin,
      message: message,
    };

    console.log("Sending email to:", updateUser.email);

    await sendMail(forgotPasswordPayload, constants.mailTypes.passwordReset);
  } catch (error) {
    console.error("Failed to send mail:", error);
    // updateUser.save({ validateBeforeSave: false });
    return responses.failureResponse(
      "Unable to send reset pin. Please try again later",
      500
    );
  }
  return responses.successResponse("Reset pin sent successfully", 200, {});
};

// verify the reset pin
const verifyResetPin = async (payload) => {
  const user = await User.findOne({ resetPin: payload.resetPin });
  if (!payload || !payload.resetPin) {
    return responses.failureResponse("Cannot be empty. Input reset pin", 400);
  }
  if (!user) {
    return responses.failureResponse("Reset PIN is expired or invalid", 400);
  }
  user.resetPin = undefined;
  user.resetPinExpires = undefined;
  await user.save();
  return responses.successResponse("Reset Pin still valid", 200);
};

// set new password
const resetPassword = async (payload) => {
  const user = await User.findOne(
    { email: payload.email }
    // { resetPin: payload.resetPin } // not necessary
  );

  if (!user) {
    return responses.failureResponse("Incorrect details", 400);
  }

  // Set the new password
  payload.password = await bcrypt.hash(payload.password, 10);

  await User.findByIdAndUpdate(
    { _id: user._id },
    { password: payload.password },
    { resetPin: null },
    { new: true }
  );

  const returnData = {
    _id: user._id,
    email: payload.email,
  };

  return responses.successResponse(
    "Password Reset Successful",
    200,
    returnData
  );
};

// User dashboard
// Get the courses that has been purchased by the user
const getUserCourses = async (userId) => {
  try {
    const courses = await PurchasedCourse.find({ userId }).populate("courseId");

    return responses.successResponse("Your courses are", 200, courses);
  } catch (error) {
    console.error("Unable to get courses", error);
    return responses.failureResponse("Failed to fetch courses", 500);
  }
};

// Get Each User Course
const getEachCourse = async (courseId) => {
  try {
    const course = await PurchasedCourse.findOne({ courseId }).populate(
      "courseId"
    );
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

// user statistics displayed on the dashboard
const getUserOverview = async (userId) => {
  try {
    const courses = await PurchasedCourse.find({ userId });
    if (!courses) {
      return responses.failureResponse("Invalid User Token", 400);
    }

    const totalEnrolledCourses = courses.length;

    const completedCourses = courses.filter(
      (course) => course.isCompleted === 1
    ).length;

    const totalWatchTimeMinutes = courses.reduce(
      (acc, course) => acc + course.minutesSpent,
      0
    );
    const totalWatchTimeHours = (totalWatchTimeMinutes / 60).toFixed(2);

    let courseCompletionRate;
    if (totalEnrolledCourses === 0) {
      courseCompletionRate = 0;
    } else {
      courseCompletionRate = (completedCourses / totalEnrolledCourses) * 100;
    }

    const returnData = {
      courseCompletionRate,
      totalEnrolledCourses,
      completedCourses,
      totalWatchTime: totalWatchTimeHours,
    };

    return responses.successResponse("Course details", 200, returnData);
  } catch (error) {
    console.error("AN error occured", error);
    return responses.failureResponse("Failed to fetch statistics", 500);
  }
};

// to recommend more courses to the user
const getUserRecommendations = async (payload) => {
  try {
    const { userId, page = 1, limit = 10, type = "random" } = payload;
    const offset = (page - 1) * limit;

    let query = Course.find();
    if (type === "related") {
      const userCourses = await PurchasedCourse.find({ userId }).populate(
        "courseId"
      );

      const categories = userCourses.map((course) => course.courseId.category);

      // to recommend courses from the same category
      query = (await query.where("category")).in(categories);
    } else if (type === "different") {
      const userCourses = await PurchasedCourse.find({ userId }).populate(
        "courseId"
      );

      const categories = userCourses.map((course) => course.courseId.category);

      // to recommend courses from different categories
      query = (await query.where("category")).nin(categories);
    } else if (type === "sameTutor") {
      const userCourses = await PurchasedCourse.find({ userId }).populate(
        "courseId"
      );

      const tutors = userCourses.map((course) => course.courseId.tutor);

      // to recommend courses from the same tutor
      query = (await query.where("tutor")).in(tutors);
    }

    const totalCourses = await query.clone().countDocuments();

    const courses = await query.skip(offset).limit(limit).exec();

    const returnData = {
      courses,
      page,
      totalPages: Math.ceil(totalCourses / limit),
      totalCourses,
    };

    return responses.successResponse(
      "Your recommended courses are: ",
      200,
      returnData
    );
  } catch (error) {
    console.error("An error occured", error);
    return responses.failureResponse("Unable to recommend courses", 500);
  }
};

// User Settings
// user update profile endpoint
const updateUser = async (userId, payload) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return responses.failureResponse("Invalid user token/Id", 400);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, payload, {
      new: true,
    });

    return responses.successResponse(
      "User details updated successfully",
      200,
      updatedUser
    );
  } catch (error) {
    console.error("There was an error updating this user", error);
    return responses.failureResponse("Unable to update user", 500);
  }
};

// Update User password
const updatePassword = async (userId, payload) => {
  try {
    const { oldPassword, newPassword } = payload;

    const user = await User.findById(userId);

    if (!user) {
      return responses.failureResponse(
        "Invalid user token. There is no user with this Id",
        400
      );
    }

    // Check if the old password is correct
    const foundPassword = await bcrypt.compare(oldPassword, user.password);

    if (!foundPassword) {
      console.log("Password does not match");
      return responses.failureResponse("This password is incorrect", 400);
    }

    // set new password and hash it
    const newpassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: newpassword },
      { new: true }
    );

    return responses.successResponse(
      "User password updated successfully",
      200,
      updatedUser
    );
  } catch (error) {
    console.error("Unable to update the password", error);
    return responses.failureResponse(
      "There was an error updating the user password",
      500
    );
  }
};

module.exports = {
  userSignUp,
  verifySignUp,
  userLogin,
  forgotPassword,
  verifyResetPin,
  resetPassword,
  getUserCourses,
  getEachCourse,
  getUserOverview,
  getUserRecommendations,
  updateUser,
  updatePassword,
};
