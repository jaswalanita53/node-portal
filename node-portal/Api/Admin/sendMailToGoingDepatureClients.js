const { dbConnect } = require("../../common/dbConnect");
const {prepareMail} = require('../../common/server');
const  fs =require('fs')
let status, data

exports.sendMailtoGoingDepartureClients = (async (request) => {
    const moment = require('moment')

    let currentDate = request?.currentDate
    try {
        const connection = await dbConnect();
        const aggregation = [
            {
                '$match': {
                    'checkOutDate': currentDate
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'userKey',
                    'foreignField': '_id',
                    'as': 'userInfo'
                }
            }, 
            {
                '$project': {
                    'roomKeys': 0,
                    'additionalGuest':0
                }
            },
            {
                '$unwind': {
                    path: '$userInfo'
                }
            },
        ]
        let getDepartureClients = await connection.db.collection("bookings").aggregate(aggregation).toArray()
        getDepartureClients.length > 0 ? status = true : status = false
        status == true ? data = getDepartureClients : data = getDepartureClients
        if(getDepartureClients.length>0){
            getDepartureClients.forEach((index,value)=>{
                fs.readFile('../../nodejs-back-end/templates/departureMail.html', {encoding: 'utf-8'}, function (err, html) {
                    if (err) {
                      console.log("this is my fault error",err);
                    } else {
                        let emailPrepare = {
                            toMail:`<${index?.userInfo?.emailAddress}>`,
                            subject:`Reminder !!`,
                            html : html
                        }
                        prepareMail(emailPrepare)
                    }
                  });
            })
        }

    }
    catch (error) {
        status = false
        data = error.message
    }
    let response = { status, data }
    return response;
})