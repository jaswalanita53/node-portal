const { dbConnect } = require("../../common/dbConnect")
let status, data

exports.getPaymentInfo = async (request) => {
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
            },{
                $project:{
                    'userInfo': 1,
                    'totalPrice':1,
                    "bookingDate":1,
                    "paymentStatus":1,
                    "bookingID":1,
                    "responseData":1,
                    "bookingDate":1,
                    "cardDetails":1
                }
            },{
                $sort: { bookingDate: -1 } 
            },
            { $limit: 100 }
            //  {
            //     '$addFields': {
            //         'roomKey': {
            //             '$map': {
            //                 'input': '$roomKeys',
            //                 'as': 'roomInfo',
            //                 'in': {
            //                     '$toObjectId': '$$roomInfo.id'
            //                 }
            //             }
            //         }
            //     }
            // }, 
            // {
            //     '$lookup': {
            //         'from': 'rooms',
            //         'localField': 'roomKey',
            //         'foreignField': '_id',
            //         'as': 'roomsInfo'
            //     }
            // }, 
            // {
            //     '$project': {
            //         'roomKey': 0
            //     }
            // },
            // {
            //     '$unwind': {
            //         path: '$userInfo'
            //     }
            // },
        ]   
        let totalBookings = await connection.db.collection("bookings").aggregate(aggregation).toArray()
        console.log("totalBookings",totalBookings)
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