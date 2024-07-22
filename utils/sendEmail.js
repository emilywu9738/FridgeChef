import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export default async (to, subject, content, isHtml) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    [isHtml ? 'html' : 'text']: content,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    // eslint-disable-next-line no-console
    console.log('Email sent:', info.response);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error sending email:', err);
  }
};
