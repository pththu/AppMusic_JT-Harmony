const transporter = require('../configs/email')

exports.sendMail = (to, subject, text, html) => {
  return transporter.sendMail({
    from: `"Music App JT-Harmony" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};