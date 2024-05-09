const bcrypt = require("bcrypt");
const Admin = require("../models/admin.model");

const seedAdmin = async () => {
  const foundAdmin = await Admin.find({ role: "Admin" });
  if (foundAdmin.length < 1) {
    const data = {
      firstName: "Aliu",
      lastName: "Omeiza",
      email: "Mabel@techware.ng",
      phone: "0811234567",
      password: await bcrypt.hash("testing", 10),
      role: "Admin",
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
