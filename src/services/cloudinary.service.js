const cloudinary = require("../config/cloudinary.config");

const uploadFileToCloudinary = async (filepath) => {
  try {
    console.log("cloudinary service", filepath);

    const result = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader
        .upload(filepath)
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    console.log({ result });

    return result.secure_url;
  } catch (error) {
    console.error(error);
  }
};

module.exports = { uploadFileToCloudinary };
