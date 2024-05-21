const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");

const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      console.log("Authorization header is missing or malformed");
      return res.status(400).json({
        message: "Authorization header must start with 'Bearer'",
        success: false,
      });
    }
    const token = authorization.substring(7);
    // Verify and decode the token
    // const decodedUser = jwt.decode(token);
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedUser._id) {
      console.log("Decoded user is invalid:", decodedUser);
      return res.status(400).json({
        message: "Invalid token",
        success: false,
      });
    }

    const foundAdmin = await Admin.findOne({ _id: decodedUser._id });

    if (!foundAdmin) {
      return res.status(400).json({
        message: "Admin not found",
        success: false,
      });
    }

    if (foundAdmin.role !== "0") {
      console.log("Found admin is not an authorized role:", foundAdmin.role);
      return res.status(400).json({
        message: "Only Admins are allowed",
        success: false,
      });
    }

    req.user = foundAdmin;
    next();
  } catch (error) {
    console.log("Error in authentication middleware:", error);
    return res
      .status(error?.statusCode || 500)
      .send(error?.message || "Unable to authenticate");
  }
};

module.exports = { authenticate };
