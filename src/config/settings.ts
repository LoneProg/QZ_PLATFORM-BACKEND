import dotenv from 'dotenv'
import path from 'path'; // ← Add this import
import { cleanEnv, str, port } from 'envalid';

// Get NODE_ENV from process.env or default to 'development'
const nodeEnv = process.env.NODE_ENV || 'development';

// Determine which .env file to load
const envFile = nodeEnv === 'production' 
  ? '.env.production' 
  : '.env.development';
// Load the specific environment file
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const settings = cleanEnv(process.env, {
  PORT: port({ default: 3000 }),
  NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
  MONGO_URI: str(),
  SMTP_HOST: str(),
  SMTP_PORT: port(),
  USER_EMAIL: str(),
  SMTP_PASSWORD: str(),
  JWT_SECRET: str(),
  JWT_EXPIRES: str(),
  BASE_URL: str(),
});

console.log(`✅ Loaded environment: ${settings.NODE_ENV}`);
console.log(`📁 Using env file: ${envFile}`);
console.log(`🗄️  MongoDB: ${settings.MONGO_URI}`);
export default settings;
