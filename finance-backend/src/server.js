require("dotenv").config();

console.log("STEP 1: dotenv loaded");

const app = require("./app");
console.log("STEP 2: app loaded");

const connectDB = require("./config/db");
console.log("STEP 3: db file loaded");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("STEP 4: connecting DB...");
    await connectDB();

    console.log("STEP 5: DB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("STARTUP ERROR:", error);
    process.exit(1);
  }
};

startServer();