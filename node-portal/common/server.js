const nodemailer = require("nodemailer");
// require('dotenv').config()

exports.prepareMail = async (user, callback) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.TESTMAIL_USERNAME,
          pass: process.env.TESTMAIL_PASSWORD,
          // user: 'harman.softweaver@gmail.com',
          // pass: 'tsslgzilwhefyuyj', 
        },
      });    
      // Email content
      const mailOptions = {
        from: process.env.TESTMAIL_USERNAME,
        // to: 'harmankaur0507@gmail.com',
        to: `${user?.toMail}`,
        subject: `${user?.subject}`,
        text: 'Hi from your nodemailer project',
        html: `${user?.html}`
      };        
      
      // Send email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
}

// exports.prepareMail = async (user, callback) => {
//     let testAccount = await nodemailer.createTestAccount();
//     let transporter = nodemailer.createTransport({
//         // host: 'smtp.ethereal.email',
//         // port: 587,
//         // secure:false,
//         // auth: {
//         //     // user: 'laurie.kilback@ethereal.email',
//         //     // pass: '58k4gaXsYaksAqMpdV'
//         //      user: testAccount.user,
//         //     pass: testAccount.pass
//         // }
//           service: 'gmail',
//               auth: {
//                   type: 'OAuth2',
//                   user: process.env.MAIL_USERNAME,
//                   pass: process.env.MAIL_PASSWORD,
//                   clientId: process.env.OAUTH_CLIENTID,
//                   clientSecret: process.env.OAUTH_CLIENT_SECRET,
//                   refreshToken: process.env.OAUTH_REFRESH_TOKEN
//               }

//     });
//     // const mailOptions = {
//     //     from: `<laurie.kilback@ethereal.email>`,
//     //     to: `${user?.toMail}`,
//     //     subject: `${user?.subject}`,
//     //     html: `${user?.html}`
//     // };
//     const mailOptions = {
//                 from: process.env.MAIL_USERNAME,
//                 to: `${user?.toMail}`,
//                 subject: `${user?.subject}`,
//                 text: 'Hi from your nodemailer project',
//                 html: `${user?.html}`
//     }

//      transporter.sendMail(mailOptions,(error,info)=>{
//             if (error) {
//         return console.log(error);
//     }
//     console.log('Message %s sent: %s', info.messageId, info.response);
//     });

// }



