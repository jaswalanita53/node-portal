const { dbConnect } = require("../../common/dbConnect")
let status, data

exports.findAccommodationByUserId = async (request) => {
    const ObjectId = require('mongodb').ObjectID
    const userId = request?.userId
    try {
        const connection = await dbConnect()
        const aggregation = [
            {
                '$match': {
                    'userKey':  ObjectId(userId)
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
        let getAccommodations = await connection.db.collection("bookings").aggregate(aggregation).toArray()
        getAccommodations.length > 0 ? status = true : status = false
        data = getAccommodations
        await connection.client.close()

    } catch (error) {
        status = false
        data = error.message
    }
    let response = { status, data }
    return response;
}