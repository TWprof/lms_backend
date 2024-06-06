const uploadService = require("../services/upload.service");

const uploadFileController = async (req, res) => {
  const data = await uploadService.uploadFile(req.files.file);
  console.log("upload file controller", data);
  res.status(data.statusCode).json(data);
};

module.exports = { uploadFileController };
