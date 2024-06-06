const cloudinaryService = require("../services/cloudinary.service");
const responses = require("../utility/send.response");
const path = require("path");
const fs = require("fs");

const uploadFile = async (file) => {
  // Create temporary folder
  const tmpUploadFilePath = `${path.resolve()}\\tmp`;

  // If tmp does exist, create tmp folder
  if (!fs.existsSync(tmpUploadFilePath)) {
    fs.mkdirSync(tmpUploadFilePath);
  }

  const tmpUploadFileName = `${tmpUploadFilePath}\\${file.name}`;

  // Move uploaded file to tmp server
  await file.mv(tmpUploadFileName);

  // Upload to cloudinary
  const result = await cloudinaryService.uploadFileToCloudinary(
    tmpUploadFileName
  );

  if (!result) {
    return responses.failureResponse("failed to upload", 400);
  }

  // Delete tmp file from server
  fs.unlinkSync(tmpUploadFileName);

  return responses.successResponse("upload successful", 200, { url: result });
};

module.exports = { uploadFile };
