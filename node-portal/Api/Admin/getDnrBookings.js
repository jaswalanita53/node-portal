const { dbConnect } = require("../../common/dbConnect")
let status, data
const moment = require('moment')
exports.getDnrBookings = async (request) => {
    let today = moment().format('YYYY-MM-DD')
    let tomorrow = moment().add(1, 'days').format('YYYY-MM-DD')
    // console.log(today)
    // console.log(tomorrow)
    try {
        const connection = await dbConnect()
        const aggregation = [
            {
                $match:{
                    $or: [
                        { "checkInDate": today },
                        { "checkInDate": tomorrow },
                        { "checkOutDate": today },
                        { "checkOutDate": tomorrow }
                      ]
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'userKey',
                    'foreignField': '_id',
                    'as': 'userInfo'
                }
            }, {
                '$addFields': {
                    'roomKey': {
                        '$map': {
                            'input': '$roomKeys',
                            'as': 'roomInfo',
                            'in': {
                                '$toObjectId': '$$roomInfo.id'
                            }
                        }
                    }
                }
            }, {
                '$lookup': {
                    'from': 'rooms',
                    'localField': 'roomKey',
                    'foreignField': '_id',
                    'as': 'roomsInfo'
                }
            }, {
                '$project': {
                    'roomKey': 0
                }
            },
            {
                '$unwind': {
                    path: '$userInfo'
                }
            },
        ]   
        let totalBookings = await connection.db.collection("bookings").aggregate(aggregation).toArray()
        // console.log(totalBookings,"totalBookings")
        totalBookings.length > 0 ? status = true : status = false
        data = totalBookings
        await connection.client.close()
    } catch (error) {
        status = false
        data = error.message
    }
    let response = { status, data }
    return response;
}