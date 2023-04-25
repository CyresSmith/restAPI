const sgMail = require('@sendgrid/mail');
const Nodemailer = require('nodemailer');

require('dotenv').config();

const { SENDGRID_API_KEY, EMAIL_FROM, GMAIL_PASS } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const transporter = Nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_FROM,
    pass: GMAIL_PASS,
  },
});

/**
 * Функция отправки почты с использованием SendGRID
 *
 * @param {object} param0 объект
 * {
 * email:  почта адресата [string],
 * subject: тема письма: [string],
 * html: текст письма в формате HTML - <p>Some text</p> или <a target="_blank" href="http: ..." >Some link</a>
 * }
 */
const sendgrid = async msg => {
  try {
    await sgMail.send({ ...msg, from: `${EMAIL_FROM}` });
    console.log('Email sent');
  } catch (error) {
    console.error(error.message);
  }
};

/**
 * Функция отправки почты с использованием Nodemailer
 *
 * @param {object} param0 объект
 * {
 * email:  почта адресата [string],
 * subject: тема письма: [string],
 * html: текст письма в формате HTML - <p>Some text</p> или <a target="_blank" href="http: ..." >Some link</a>
 * }
 */
const nodemailer = async msg => {
  try {
    await transporter.sendMail({ ...msg, from: `${EMAIL_FROM}` });
    console.log('Email sent');
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = { sendgrid, nodemailer };
