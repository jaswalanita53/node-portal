const { ObjectId } = require("mongodb");
const { dbConnect } = require("../../common/dbConnect");
const nodemailer = require("nodemailer");
let status, message, result;
const cron = require('node-cron');

// Schedule a task for June 7, 2016, at 20:14 (8:14 PM)
exports.editcsvSchedule = async (request) => {
    let recieveddata = request.body;
    // console.log(recieveddata, "@@@@@@@@@")
    let emailAddresses = recieveddata.values.emailDistritributionList
    let { time, weekdays, subject, emailbody, reportName } = recieveddata.values;
    // console.log(recieveddata.values, "asdasd")
    let csvContent = recieveddata.csvContent;
    let min = time.split(":")[1]
    let hour = time.split(":")[0]

    let weekdaysdata = weekdays.map(value => {
        switch (value) {
            case "SUN":
                return 0
                break;
            case "MON":
                return 1
                break;
            case "TUE":
                return 2
                break;
            case "WED":
                return 3
                break;
            case "THU":
                return 4
                break;
            case "FRI":
                return 5
                break;
            case "SAT":
                return 6
                break;
            default:
                return 0;
        }
    })

    let schedulestring = `${min} ${hour} * * ${weekdaysdata.toString()}`
    console.log(schedulestring, "schedulestring")
    try {
        let task = {};
        task[reportName + time + subject] = cron.schedule(schedulestring, () => {
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

            const mailOptions = {
                from: process.env.MAIL_USERNAME,
                to: emailAddresses,
                subject: subject,
                text: "Scheduled Report",
                html: emailbody,
                attachments: [
                    {
                        filename: "report.csv",
                        content: csvContent,
                    },
                ],
            };
      
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    result = false
                    message = error;
                    console.log(error);
                    return error
                }
                console.log("Message %s sent: %s", info.messageId, info.response);
            });
        }, {
            scheduled: true,
            timezone: "Asia/Calcutta"
        })

        const connection = await dbConnect();
        result = await connection.db.collection("automatedReport").updateOne({
            _id: ObjectId(recieveddata.values.id)
        },{
            $set: {
                "taskName": reportName + time + subject,
                reportName: reportName,
                values: recieveddata.values,
                csvdata: csvContent,
                data: {
                    report: recieveddata.bodydata
                }
}
        });
        console.log(result,"###################")
        result.modifiedCount > 0 ? (status = true) : (status = false);

        status
            ? (message = `Email will be sent on everyweek on ${weekdays.toString()} at ${time}`)
            : "";

    } catch (error) {
        status = false;
        message = error.message;
    }
    let response = { status, message };
    return response;
};


