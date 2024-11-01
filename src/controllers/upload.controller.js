const uploadService = require("../services/upload.service");

// File Upload Controller
const uploadFileController = async (req, res) => {
  const data = await uploadService.uploadFile(req.files.file);
  res.status(data.statusCode).json(data);
};

module.exports = { uploadFileController };
