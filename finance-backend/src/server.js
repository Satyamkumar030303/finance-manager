require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const cache = require("./utils/cache");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("1. Starting DB...");
    await connectDB();

    console.log("2. DB Connected");

    console.log("3. Starting Redis...");
    await cache.connect();

    console.log("4. Redis done");

    console.log("5. Starting server...");

    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`
      );
    });
  } catch (error) {
    console.error("STARTUP ERROR:", error);
    process.exit(1);
  }
};

startServer();