const tutorServices = require("../services/tutor.service");

const tutorOverviewController = async (req, res) => {
  const tutorId = req.user._id;

  if (req.role != "1") {
    return res.status(403).json({ message: "Tutors only" });
  }

  const data = await tutorServices.tutorOverview(tutorId);

  res.status(data.statusCode).json(data);
};

module.exports = {
  tutorOverviewController,
};
