const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const tutorController = require("../controllers/tutor.controller");

router.get(
  "/dashboard",
  authMiddleware.authenticate,
  tutorController.tutorOverviewController
);

router.get(
  "/my-courses",
  authMiddleware.authenticate,
  tutorController.tutorCoursesController
);

module.exports = router;
