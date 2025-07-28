const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  for (const record of event.Records) {
    try {
      const message = JSON.parse(record.body);

      const { email, subject, body } = message;

      if (!email || !subject || !body) {
        console.warn("Missing required fields in message:", message);
        continue;
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: `"DALScooter" <${process.env.SMTP_USER}>`,
        to: email,
        subject: subject,
        text: body
      });

      console.log(`Email sent to ${email}`);
    } catch (error) {
      console.error("Error sending email:", error.message, error.stack);
    }
  }
};