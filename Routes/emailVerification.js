
const express = require('express');
const app = express();
const router=express.Router();
const { Resend } = require('resend');  // درست import کردن Resend
const resend = new Resend('re_6k7g6xni_7MHWamcJmpz1ipTaq3xbVvpC');
// ----------------------------------
async function sendEmail() {
  try {
    const data = await resend.emails.send({
      from: 'y.bayat.mech@gmail.com',  // آدرس فرستنده
      to: 'yahya.bayat.nosrat@gmail.com',      // آدرس گیرنده
      subject: 'Your Verification Code',
      text: 'Your verification code is 123456'
    });

    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

sendEmail();
// --------------------------------------------------
module.exports = router;