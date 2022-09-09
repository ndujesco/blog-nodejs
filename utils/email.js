const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "emailforpython26@gmail.com", // generated ethereal user
    pass: process.env.EMAIL_PASSWORD, // generated ethereal password
  },
});

exports.sendEmail = async (details) => {
  return transporter.sendMail({
    from: "emailforpython26@gmail.com", // sender address
    to: "ugopeter26@gmail.com", // list of receivers
    subject: "A message from your blog user",
    html: `<p>Name: <b>${details.name}</b></p>
    <p>email: <em>${details.email}</em></p>
    <p>Phone number: <em>${details.number}</em></p>
    <p>Message: <b>${details.message}</b></p>`,
    // html body
  });
};
