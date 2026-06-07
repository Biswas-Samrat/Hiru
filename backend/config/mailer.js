const nodemailer = require('nodemailer');

const secure = process.env.SMTP_SECURE === 'true';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: secure, // true for 465 (SSL), false for 587 (TLS/STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify SMTP connection config
const verifySMTP = () => {
  transporter.verify((error, success) => {
    if (error) {
      console.error('✗ Email sending failed: SMTP connection error during verification:', error.message);
    } else {
      console.log('✓ Email sent successfully: SMTP server is ready to take messages');
    }
  });
};

module.exports = {
  transporter,
  verifySMTP
};
