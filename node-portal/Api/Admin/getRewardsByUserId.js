const { dbConnect } = require("../../common/dbConnect")
let status, message

exports.getRewardsByUserId = async (request) => {
    const userId = request?.userId
    try {
        const ObjectId = require('mongodb').ObjectID
        let connection = await dbConnect();
        let query = { 'userKey': ObjectId(userId) }
        let rewards = await connection.db.collection('bookings').find(query).toArray();
        rewards ? status = true : status = false
        status == true ? data = rewards : data = rewards
    } catch (error) {
        status = false
        message = error.message
    }
    let response = { status, data }
    return response
}