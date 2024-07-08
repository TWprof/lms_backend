const userServices = require("../services/user.service");

// Student signup controller
const userSignUpController = async (req, res) => {
  const data = await userServices.userSignUp(req.body);
  res.status(data.statusCode).json(data);
};

// Verify User Email Controller
const verifyUserEmailController = async (req, res) => {
  const data = await userServices.verifySignUp(req.query.verificationToken);
  res.status(data.statusCode).json(data);
};

// User Login controller
const userLoginController = async (req, res) => {
  const data = await userServices.userLogin(req.body);
  res.status(data.statusCode).json(data);
};

// Forgot password Controller
const userForgotPasswordController = async (req, res) => {
  const data = await userServices.forgotPassword(req.body);
  res.status(data.statusCode).json(data);
};

// Verify reset Pin Controller
const verifyResetPinController = async (req, res) => {
  const data = await userServices.verifyResetPin(req.body);
  res.status(data.statusCode).json(data);
};

// Reset Password Controller
const resetPasswordController = async (req, res) => {
  const data = await userServices.resetPassword(req.body);
  res.status(data.statusCode).json(data);
};

// Get User Courses Controller
const getUserCoursesController = async (req, res) => {
  const userId = req.user._id;
  const data = await userServices.getUserCourses(userId);
  res.status(data.statusCode).json(data);
};

module.exports = {
  userSignUpController,
  verifyUserEmailController,
  userLoginController,
  userForgotPasswordController,
  verifyResetPinController,
  resetPasswordController,
  getUserCoursesController,
};
