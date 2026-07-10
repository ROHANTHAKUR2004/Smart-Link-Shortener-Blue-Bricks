import app from "./app.js";
import config from "./config/index.js";
import { connectDB } from "./config/db.js";

const start = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error(`Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });

};

start();
