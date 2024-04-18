const { dbConnect } = require("../../common/dbConnect")
let status, data

exports.getBookingsQuaterly = async (request) => {
    const moment = require("moment")
    const currentDate = request?.currentDate
    const lastDate = moment().subtract(90, 'days').format('YYYY-MM-DD')
    // console.log(lastDate,"lastdate")
    // console.log(currentDate, "currentDate")
    try {
        const connection = await dbConnect()
        const aggregation = [
            {
                '$match': {
                    'checkInDate':  {
                        "$gte": lastDate,
                        "$lte": currentDate
                    }
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
        let todayBookings = await connection.db.collection("bookings").aggregate(aggregation).toArray()
        // console.log(todayBookings,"sadsads")
        let totalAccommodationBooked = todayBookings.reduce((a, b) => a + b.noOfRooms, 0)
        todayBookings.length > 0 ? status = true : status = false
        data = {
            totalArrivals: todayBookings.length,
            totalAccommodationBooked: totalAccommodationBooked,
            todayBookings: todayBookings,
        }
        await connection.client.close()
    } catch (error) {
        status = false
        data = error.message
    }
    let response = { status, data }
    return response;
}
