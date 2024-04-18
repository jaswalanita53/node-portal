const { ObjectId } = require("mongodb");
const { dbConnect } = require("../../common/dbConnect");
const nodemailer = require("nodemailer");
let status, message;

exports.sharecsv = async (request) => {
//   console.log(request, "request");
  // console.log(request.query);
    try {

        // console.log("we are here")
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
          clientId: process.env.OAUTH_CLIENTID,
          clientSecret: process.env.OAUTH_CLIENT_SECRET,
          refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        },
      });
// console.log("we are here2");
      // };
      const mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: request.query.emailAddress,
        subject: request.query.reportName,
        text: "Hi from your nodemailer project",
        html: `Report Attached`,
        attachments: [
          {
            filename: "report.csv",
            content: request.query.csvContent,
          },
        ],
        // attachment: request.query.formData,
      };

      let result=true;
      // console.log("we are here3");
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            result =false
          return console.log(error);
        }
        console.log("Message %s sent: %s", info.messageId, info.response);
      });

      result===true ? (status = true) : (status = false);
      status
        ? (message = "Email send successfully with report as attachment")
        : (message = "There is some error");
    } catch (error) {
      status = false;
      message = error.message;
    }
  let response = { status, message };
  return response;
};


