import nodemailer from 'nodemailer';

/**
 * Enterprise email utility to send transactional emails.
 * @param {Object} options - Object containing email, subject, and message.
 */
const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Fiver Support <support@fiver.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: `<p>${options.message}</p>`, // Placeholder for HTML email templates
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
