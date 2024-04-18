const { dbConnect } = require("../../common/dbConnect");
const ObjectId = require('mongodb').ObjectID


exports.getReservationById = (async (request) => {
    // console.log(request)
    if(!request.id){
        return { error: 'Bad Request', message: 'No id provided', status: 400 };
    }
    let status, data
    const Id = request?.id
    const aggregation = [
        {
            '$match': {
                '_id': ObjectId(Id)
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
    try {
        const connection = await dbConnect()
        const reservation = await connection.db.collection('bookings').aggregate(aggregation).toArray()
        reservation.length == 1 ? status = true : status = false;
        status ? data = reservation[0] : data = null
    } catch (error) {
        status = false
        data = error.message
    }
    let response = { status, data }
    return response;
})