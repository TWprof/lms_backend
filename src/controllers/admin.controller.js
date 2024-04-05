const adminServices = require("../services/admin.service");

// STAFF CONTROLLERS
const createStaffController = async (req, res) => {
  const data = await adminServices.createAdmin(req.body);
  res.status(data.statusCode).json(data);
};

const loginStaffController = async (req, res) => {
  const data = await adminServices.loginStaff(req.body);
  res.status(data.statusCode).json(data);
};

// TUTOR CONTROLLERS
const loginTutorController = async (req, res) => {
  const data = await adminServices.tutorLogin(req.body);
  res.status(data.statusCode).json(data);
};
module.exports = {
  createStaffController,
  loginStaffController,
  loginTutorController,
};
