const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendMail = async (mailOptions) => {
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email Sent:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

module.exports = {
    sendMail
};
