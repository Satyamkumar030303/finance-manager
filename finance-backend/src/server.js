require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const cache = require("./utils/cache");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await cache.connect(); // Redis — optional, degrades gracefully if unavailable
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
    });
  } catch (error) {
    console.error("STARTUP ERROR:", error);
    process.exit(1);
  }
};

startServer();
