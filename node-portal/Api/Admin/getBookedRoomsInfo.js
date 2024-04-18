const { dbConnect } = require("../../common/dbConnect")
let status, data

exports.getBookedRoomsInfo = async (request) => {
    try {
        const aggregate1 = [{
            $match: {
                "checkInDate": request.checkInDate
            }
        }, {
            $project: {
                "checkInDate": 1,
                "roomKeys": 1
            }
        }, {
            $unwind: '$roomKeys'
        }, {
            $group: {
                _id: "$roomKeys.id",
                totalRoomsOfThisType: { $sum: "$roomKeys.noOfRooms" }
            }
        }, {
            $project: {
                _id: {
                    $toObjectId: "$_id"
                },
                totalRoomsOfThisType: 1
            }
        }, {
            $lookup: {
                from: "rooms",
                localField: "_id",
                foreignField: "_id",
                as: "roomData"
            }
        }, {
            $unwind: "$roomData"
        }, {
            $project: {
                totalRooms: "$roomData.totalNumberOfRooms",
                _id: 1,
                roomName: "$roomData.roomName",
                totalRoomsOfThisType: 1
            }
        }
        ]

        const connection = await dbConnect()
        let getRoomsTypes = await connection.db.collection("bookings").aggregate(aggregate1).toArray();
        console.log("getRoomsTypes", getRoomsTypes);
        data = getRoomsTypes
        status = true

    } catch (error) {
        console.log(error);
        status = false
        data = error.message
    }

    let response = { status, data }
    return response;

}