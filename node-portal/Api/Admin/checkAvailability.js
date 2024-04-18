const { dbConnect } = require("../../common/dbConnect")
let status, message;
let data = {}

exports.checkAvailability = async (request) => {
    const arrivalDate = request?.arrivalDate
    const departureDate = request?.departureDate

    try {
        const connection = await dbConnect()
        const aggregation = [
            {
                '$match': {
                    'checkInDate': {
                        "$gte": arrivalDate,
                    },
                    'checkOutDate': {
                        "$gte": departureDate
                    }
                }
            },
            {
                '$unwind': {
                    'path': '$roomKeys'
                }
            }, {
                '$group': {
                    '_id': '$roomKeys.id',
                    'totalAmount': {
                        '$sum': '$roomKeys.noOfRooms'
                    }
                }
            }
        ]
        const query = { checkInDate: arrivalDate, checkOutDate: departureDate }
        const getBookings = await connection.db.collection('bookings').aggregate(aggregation).toArray()
        // console.log("getBookings",getBookings)
        const getMaintenance = await connection.db.collection('maintenance').find({'createdAt':arrivalDate}).toArray()
        const getRooms = await connection.db.collection('rooms').find().toArray();
        if (getBookings.length > 0) {
            const totalRoomsAvailable = getRooms.reduce((a, b) => a + b.totalNumberOfRooms, 0)
            const totalBookings = getBookings.reduce((a, b) => a + b.totalAmount, 0)
            const vacantRooms = totalRoomsAvailable - totalBookings

            vacantRooms > 0 ? data.roomAvailability = true : data.roomAvailability = false
            data.roomsAvailable = getBookings.map((value, index) => {
                let totalAmount = getRooms[index].totalNumberOfRooms - value.totalAmount
                value.availableRoom = totalAmount
                value.roomName = getRooms[index].roomName
                return value
            })
        } else {
            data.roomAvailability = true
            data.roomsAvailable = getRooms
        }
    } catch (error) {
        status = false
        message = error.message
    }

    let response = { status, data, message }
    return response;

}