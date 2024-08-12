const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth");

// Authentication Routes
// signup route
router.post("/signup", userController.userSignUpController);

// verify email route
router.get("/verify-email", userController.verifyUserEmailController);

// login route
router.post("/login", userController.userLoginController);

// forgot password route
router.post("/forgot-password", userController.userForgotPasswordController);

// verify otp route
router.post("/verify-pin", userController.verifyResetPinController);

// reset password route
router.post("/reset-password", userController.resetPasswordController);

// User Dashboard Routes
// get user purchased courses route
router.get(
  "/dashboard",
  authMiddleware.authenticate,
  userController.getUserCoursesController
);

// overview statistics route
router.get(
  "/overview",
  authMiddleware.authenticate,
  userController.getUserOverviewController
);

// recommendations route
router.get(
  "/recommendations",
  authMiddleware.authenticate,
  userController.getUserRecommendationsController
);

// get a single purchased course by user
router.get(
  "/dashboard/:courseId",
  authMiddleware.authenticate,
  userController.getEachUserCourseController
);

// User profile settings //
// Update user
router.put(
  "/update-user",
  authMiddleware.authenticate,
  userController.updateUserController
);

// Update user password
router.put(
  "/update-password",
  authMiddleware.authenticate,
  userController.updatePasswordController
);
module.exports = router;
