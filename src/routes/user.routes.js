const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.post("/signup", userController.userSignUpController);
router.get("/verify-email", userController.verifyUserEmailController);
router.post("/login", userController.userLoginController);
router.post("/forgot-password", userController.userForgotPasswordController);
router.post("/verify-pin", userController.verifyResetPinController);
router.post("/reset-password", userController.resetPasswordController);
module.exports = router;
