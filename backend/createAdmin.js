const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // Find the user
    const user = await User.findOne({
      email: "sahil@example.com",
    });

    // Check whether user exists
    if (!user) {
      console.log("User not found");
      process.exit(1);
    }

    // Change role to admin
    user.role = "admin";

    // Save updated user
    await user.save();

    console.log(`Admin role assigned to ${user.email}`);

    // Close database connection
    await mongoose.connection.close();

    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error.message);

    await mongoose.connection.close();

    process.exit(1);
  }
};

createAdmin();