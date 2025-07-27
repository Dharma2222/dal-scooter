const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  for (const record of event.Records) {
    try {
      const snsWrapped = JSON.parse(record.body);      // SQS wraps SNS message
      const message = JSON.parse(snsWrapped.Message);   // SNS wraps actual payload

      const { email, subject, body } = message;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,      // from Lambda env var
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: '"DALScooter" <' + process.env.SMTP_USER + '>',
        to: email,
        subject: subject,
        text: body
      });

      console.log(`Email sent to ${email}`);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }
};
