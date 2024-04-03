const userServices = require("../services/user.service");

const userSignUpController = async (req, res) => {
  const data = await userServices.userSignUp(req.body);
  res.status(data.statusCode).json(data);
};

const userLoginController = async (req, res) => {
  const data = await userServices.userLogin(req.body);
  res.status(data.statusCode).json(data);
};

module.exports = {
  userSignUpController,
  userLoginController,
};
