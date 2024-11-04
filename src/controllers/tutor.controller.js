const tutorServices = require("../services/tutor.service");

const tutorOverviewController = async (req, res) => {
  const tutorId = req.user._id;
  const timePeriod = req.query.timeperiod || "month";

  if (req.role != "1") {
    return res.status(403).json({ message: "Tutors only" });
  }
  console.log("Controller Time Period:", timePeriod);
  const data = await tutorServices.tutorOverview(tutorId, timePeriod);

  res.status(data.statusCode).json(data);
};

const tutorCoursesController = async (req, res) => {
  const tutorId = req.user._id;

  if (req.role != "1") {
    return res.status(403).json({ message: "Tutors only" });
  }

  const data = await tutorServices.tutorMyCourses(tutorId);

  res.status(data.statusCode).json(data);
};

const tutorStudentController = async (req, res) => {
  const tutorId = req.user._id;

  if (req.role != "1") {
    return res.status(403).json({ message: "Tutors only" });
  }

  const data = await tutorServices.tutorStudents(tutorId);

  res.status(data.statusCode).json(data);
};

const tutorTransactionController = async (req, res) => {
  const tutorId = req.user._id;

  if (req.role != "1") {
    return res.status(403).json({ message: "Tutors only" });
  }

  const data = await tutorServices.tutorTransactions(tutorId);

  res.status(data.statusCode).json(data);
};

module.exports = {
  tutorOverviewController,
  tutorCoursesController,
  tutorStudentController,
  tutorTransactionController,
};
