const { Resend } = require("resend");

console.log("🔑 RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const sendMail = async (to, subject, html) => {
  if (!resend) {
    console.warn("⚠️ Mail skipped: RESEND_API_KEY not set");
    return;
  }

  console.log("📧 Attempting to send email to:", to);

  try {
    const res = await resend.emails.send({
      from: "MedInventory <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    console.log("✅ Resend response:", res);
  } catch (err) {
    console.error("❌ MAIL ERROR FULL:", err);
  }
};

module.exports = sendMail;
