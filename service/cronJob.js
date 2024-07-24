import cron from 'node-cron';
import mongoose from 'mongoose';
import 'dotenv/config';
import nodemailer from 'nodemailer';

import Fridge from '../models/fridgeModel.js';
import Notification from '../models/notificationModel.js';

mongoose.connect(process.env.MONGOOSE_CONNECT);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

const today = new Date();
today.setHours(0, 0, 0, 0);
const threeDaysLater = new Date();
threeDaysLater.setHours(0, 0, 0, 0);
threeDaysLater.setDate(threeDaysLater.getDate() + 3);

const dateForDisplay = today.toLocaleDateString('zh-TW', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

async function notifyExpiringItems() {
  try {
    const allFridge = await Fridge.find().populate({
      path: 'members',
      select: 'email',
    });

    const ingredientsForNotify = allFridge.map((fridge) => {
      const notification = { expired: [], expiring: [] };
      fridge.ingredients.forEach((category) => {
        category.items.forEach((item) => {
          const expirationDate = new Date(item.expirationDate);
          expirationDate.setHours(0, 0, 0, 0);
          if (expirationDate < today) {
            notification.expired.push(item.name);
          }
          if (expirationDate < threeDaysLater) {
            notification.expiring.push(item.name);
          }
        });
      });
      const fridgeId = fridge._id.toString();
      const { name, members } = fridge;
      return { name, members, fridgeId, items: notification };
    });

    ingredientsForNotify.forEach(async (fridge) => {
      const expired =
        fridge.items.expired.length > 0
          ? fridge.items.expired.join('、 ')
          : '無';

      const expiring =
        fridge.items.expiring.length > 0
          ? fridge.items.expiring.join('、 ')
          : '無';

      if (expiring !== '無' || expired !== '無') {
        const notification = new Notification({
          type: 'expire',
          target: { type: 'Fridge', id: fridge.fridgeId },
          content: `【 ${fridge.name} 】${dateForDisplay} — 已過期：${expired}，即將過期：${expiring}`,
        });
        await notification.save();

        fridge.members.forEach((member) => {
          sendEmail(
            member.email,
            '【FridgeChef】食材過期通知',
            `【 ${fridge.name} 】\n已過期：${expired}\n即將過期：${expiring}`,
          );
        });

        console.log('Notification saved and email sent successfully!');
      }
    });
  } catch (err) {
    console.error(err);
  }
}

const scheduleTasks = () => {
  cron.schedule(
    '0 5 * * *',
    () => {
      notifyExpiringItems();
    },
    {
      scheduled: true,
      timezone: 'Asia/Taipei',
    },
  );
};

scheduleTasks();
