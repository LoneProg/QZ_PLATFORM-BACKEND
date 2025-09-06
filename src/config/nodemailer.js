const nodemailer = require('nodemailer');
require('dotenv').config();
import { settings } from './config/settings'

const transporter = nodemailer.createTransport({
  host: settings.SMTP_HOST,
  port: settings.SMTP_PORT,
  secure: true,
  auth: {
    user: settings.USER_EMAIL, // Your email address
    pass: settings.EMAIL_PASSWORD, // Your email password
  },
});

module.exports = transporter;
