const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("createAdminUser");

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.email);
      return;
    }

    // Create admin user
    const adminUser = new User({
      email: "admin@admin.com",
      username: "admin",
      password: "admin123", // This will be hashed automatically
      role: "admin",
    });

    await adminUser.save();
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
};

// Run the script
createAdminUser();
