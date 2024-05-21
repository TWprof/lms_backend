const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
// const authMiddleware = require("../middleware/auth");

router.post(
  "/register",
  // authMiddleware.authenticate,
  adminController.createUserController
);
router.post("/set-password", adminController.setUserPasswordController);
router.post("/login", adminController.loginUserController);
module.exports = router;
