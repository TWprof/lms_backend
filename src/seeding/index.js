const bcrypt = require("bcrypt");
const Admin = require("../models/admin.model");

const seedAdmin = async () => {
  const foundAdmin = await Admin.findOne({ role: "0" });
  if (!foundAdmin) {
    const data = {
      firstName: "Aliu",
      lastName: "Omeiza",
      email: "mabel@techware.ng",
      phone: "0811231367",
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
      role: "0",
    };

    const createAdmin = await Admin.create(data);
    if (!createAdmin) {
      console.log("Unable to seed data");
      return;
    }
    console.log("Admin seeding successful");
    return;
  }
  return;
};
module.exports = seedAdmin;
