const { dbConnect } = require("../../common/dbConnect")
let status, data

exports.getBookingsByMonth = async (request) => {
    const moment = require("moment")
    // const currentDate = new Date(request?.currentDate)
    const providedDate = moment(request?.currentDate);
    const firstDayOfMonth = providedDate.clone().startOf('month').format('YYYY-MM-DD');
    const lastDayOfMonth = providedDate.clone().endOf('month').format('YYYY-MM-DD');

    // console.log(firstDayOfMonth); // First day of the month
    // console.log(lastDayOfMonth);
    
    try {
        const connection = await dbConnect()
        const aggregation = [
            {
                
                    '$match':{
                        'bookingDate': {
                            '$gte': firstDayOfMonth,
                            '$lte': lastDayOfMonth
                        },
                    }
                },{
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
        // console.log(todayBookings,"todayBookings");
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