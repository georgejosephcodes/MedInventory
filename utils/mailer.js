const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ALERT_EMAIL,
    pass: process.env.ALERT_EMAIL_PASSWORD,
  },
});

const sendMail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"MedInventory" <${process.env.ALERT_EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("MAIL ERROR:", err.message);
  }
};

module.exports = sendMail;
