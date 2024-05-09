const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");

const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(400).json({
        message: "Authorization header must start with 'Bearer'",
        success: false,
      });
    }
    const token = authorization.substring(7);

    const decodedUser = await jwt.decode(token);

    const foundAdmin = await Admin.findOne({ _id: decodedUser._id });
    if (foundAdmin.role !== "Admin") {
      return res.status(400).json({
        message: "Only Admins are allowed",
        success: false,
      });
    }
    req.user = foundAdmin;
    next();
  } catch (error) {
    return res
      .status(error?.statusCode || 500)
      .send(error?.message || "Unable to authenticate");
  }
};

module.exports = {
  authenticate,
};
