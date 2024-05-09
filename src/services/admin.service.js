const Admin = require("../models/admin.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const responses = require("../utility/send.response");
const sendMail = require("../utility/mails/index");
const constants = require("../constants");
const crypto = require("crypto");

const createUser = async (payload) => {
  // User = Staff, Tutor
  const foundUser = await Admin.findOne({ email: payload.email });
  if (foundUser) {
    return responses.failureResponse(
      "Email already registered. Please provide another",
      403
    );
  }
  payload.registrationToken = crypto.randomBytes(20).toString("hex");
  payload.tokenExpiration = new Date(Date.now() + 3600000);
  await User.create(payload);
  const message = `
  <h1>Set password</h1>
            <p> Follow this link to set your password and you can proceed to login:</p>
            <a href="${process.env.ADMIN_HOST}set-password?registrationToken=${payload.registrationToken}">Set your password here</a>
  `;
  const emailPayload = {
    to: payload.email,
    subject: "Complete Registration",
    message: message,
  };
  // send email by calling sendMail function
  await sendMail(emailPayload, constants.mailTypes.setPassword);
  const data = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
  };
  return responses.successResponse("User created successfully", 200, data);
};

module.exports = {
  createUser,
};
