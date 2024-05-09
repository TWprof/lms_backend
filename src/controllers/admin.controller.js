const adminServices = require("../services/admin.service");

// STAFF CONTROLLERS
const createUserController = async (req, res) => {
  const data = await adminServices.createUser(req.body);
  res.status(data.statusCode).json(data);
};

// const loginStaffController = async (req, res) => {
//   const data = await adminServices.loginStaff(req.body);
//   res.status(data.statusCode).json(data);
// };

// // TUTOR CONTROLLERS
// const loginTutorController = async (req, res) => {
//   const data = await adminServices.tutorLogin(req.body);
//   res.status(data.statusCode).json(data);
// };
module.exports = {
  createUserController,
  // loginStaffController,
  // loginTutorController,
};
