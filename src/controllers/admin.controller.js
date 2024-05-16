const adminServices = require("../services/admin.service");

// STAFF CONTROLLERS
const createUserController = async (req, res) => {
  const data = await adminServices.createUser(req.body);
  res.status(data.statusCode).json(data);
};

const setUserPasswordController = async (req, res) => {
  const data = await adminServices.setUserPassword(req.body);
  res.status(data.statusCode).json(data);
};

const loginUserController = async (req, res) => {
  const data = await adminServices.login(req.body);
  res.status(data.statusCode).json(data);
};

module.exports = {
  createUserController,
  setUserPasswordController,
  loginUserController,
};
