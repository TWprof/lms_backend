const userServices = require("../services/user.service");

// Student signup and login controllers
const userSignUpController = async (req, res) => {
  const data = await userServices.userSignUp(req.body);
  res.status(data.statusCode).json(data);
};

const verifyUserEmailController = async (req, res) => {
  const data = await userServices.verifySignUp(req.query.verificationToken);
  res.status(data.statusCode).json(data);
};

const userLoginController = async (req, res) => {
  const data = await userServices.userLogin(req.body);
  res.status(data.statusCode).json(data);
};

const userForgotPasswordController = async (req, res) => {
  const data = await userServices.forgotPassword(req.body);
  res.status(data.statusCode).json(data);
};

const verifyResetPinController = async (req, res) => {
  const data = await userServices.verifyResetPin(req.body);
  res.status(data.statusCode).json(data);
};

const resetPasswordController = async (req, res) => {
  const data = await userServices.resetPassword(req.body);
  res.status(data.statusCode).json(data);
};

module.exports = {
  userSignUpController,
  verifyUserEmailController,
  userLoginController,
  userForgotPasswordController,
  verifyResetPinController,
  resetPasswordController,
};
