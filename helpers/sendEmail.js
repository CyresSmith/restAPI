const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const { SENDGRID_API_KEY, EMAIL_FROM } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

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
const sendEmail = async msg => {
  try {
    await sgMail.send({ ...msg, from: `${EMAIL_FROM}` });
    console.log('Email sent');
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = sendEmail;
