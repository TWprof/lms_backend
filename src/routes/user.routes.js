const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.post("/signup", userController.userSignUpController);
router.post("/login", userController.userLoginController);

module.exports = router;
