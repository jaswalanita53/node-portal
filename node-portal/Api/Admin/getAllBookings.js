const { dbConnect } = require("../../common/dbConnect")
let status, data

exports.getAllBookings = async (request) => {
    try {
        const connection = await dbConnect()
        const aggregation = [
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