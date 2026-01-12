const User = require("../models/User.model");

const createAdminIfNotExists = async () => {
  const adminExists = await User.findOne({ role: "ADMIN" });

  if (adminExists) {
    console.log("Admin already exists");
    return;
  }

  await User.create({
    name: "Admin",
    email: "admin@med.com",
    password: "admin123",
    role: "ADMIN",
    forcePasswordChange: true,
  });

  console.log("Admin user created");
};

module.exports = createAdminIfNotExists;
