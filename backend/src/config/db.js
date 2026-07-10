import mongoose from "mongoose";
import config from "./index.js";

export const connectDB = async () => {
  mongoose.connection.on("error", (err) => {
    console.error(`MongoDB error: ${err.message}`);
  });

  const conn = await mongoose.connect(config.mongoUri);
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};

export default connectDB;
