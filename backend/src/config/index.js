import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not set in the environment");
}

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI,
};

export default config;
