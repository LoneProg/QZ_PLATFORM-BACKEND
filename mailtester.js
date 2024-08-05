const nodemailer = require('nodemailer');
require('dotenv').config();
const path = require("path")

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

const mailOptions = {
    from: {
        name: "Qzplatform",
        address: process.env.EMAIL,
    },
    to: 'hakeemabdullah87@gmail.com',
    subject: 'Testing email with attachment',
    text: 'This is a test email.',
    html: "<h1>Welcome to QzPlatform</h1>",
    attachments: {
        filename: 'sample.pdf',
        path: path.join(__dirname, "sample.pdf"),
        contentType: 'application/pdf'
    }
};

const sendMail = async (transporter, mailOptions) => {
    try {
        await transporter.sendMail(mailOptions);
        console.log("Email Sent", info.response)
    } catch {
        console.error("Error sending email", error)

    }
}

sendMail(transporter, mailOptions);

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error("Error sending email:", error);
    } else {
        console.log("Email sent:", info.response);
    }
});
