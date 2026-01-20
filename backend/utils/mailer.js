const { Resend } = require("resend");

if (!process.env.RESEND_API_KEY) {
  console.error("RESEND_API_KEY is missing");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async (to, subject, html) => {
  try {
    await resend.emails.send({
      from: "MedInventory <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("MAIL ERROR:", err);
  }
};

module.exports = sendMail;
