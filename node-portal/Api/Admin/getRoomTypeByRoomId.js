const { dbConnect } = require("../../common/dbConnect")
const ObjectId = require('mongodb').ObjectID
let status, data

exports.getRoomTypeByRoomId = async (request) => {
    try {
        let query = { 'roomType': ObjectId(request?.roomTypeId) }
        const connection = await dbConnect()
        const checkMaintenance = await connection.db.collection('maintenance').find({ 'roomTypeId': ObjectId(request?.roomTypeId) }).toArray()
        const roomDetails = await connection.db.collection('rooms').find(query).toArray()
        roomDetails.length > 0 ? status = true : status = false
        status ? data = { 'roomDetails': roomDetails[0], 'checkMaintenance': checkMaintenance } : data = null
    } catch (error) {
        status = false
        data = error.message
    }
    let response = { status, data }
    return response
}