import dotenv from "dotenv";
dotenv.config(); // <-- must come first
import { cleanEnv, str, port } from "envalid";

const settings = cleanEnv(process.env, {
  PORT: port({ default: 3000 }),
  NODE_ENV: str({ choices: ["development", "production", "test"] }),
  MONGO_URI: str(),
  EMAIL_HOST: str(),
  EMAIL_PORT: port(),
  EMAIL: str(),
  EMAIL_PASSWORD: str(),
  JWT_SECRET: str(),
  JWT_EXPIRES: str(),
  BASE_URL: str(),
});

export default settings;
