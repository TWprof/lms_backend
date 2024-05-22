const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const responses = require("../utility/send.response");
const generateResetPin = require("../utility/auth/generateOTP");
const sendMail = require("../utility/mails/index");
const constants = require("../constants");
const crypto = require("crypto");

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
  const resetPinExpires = new Date(Date.now() + 300000);
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
  try {
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

const resetPassword = async (payload) => {
  const user = await User.findOne(
    { email: payload.email }
    // { resetPin: payload.resetPin } // not necessary
  );
  if (!user) {
    return responses.failureResponse("Incorrect details", 400);
  }
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

module.exports = {
  userSignUp,
  verifySignUp,
  userLogin,
  forgotPassword,
  verifyResetPin,
  resetPassword,
};
