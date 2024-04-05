const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");

// ADMIN X STAFF ROUTES
router.post("/staff-signup", adminController.createStaffController);
router.post("/staff-login", adminController.loginStaffController);

// TUTOR ROUTES
router.post("/tutor-login", adminController.loginTutorController);
module.exports = router;
