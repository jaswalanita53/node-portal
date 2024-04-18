const { dbConnect } = require("../../common/dbConnect");
let status, data,message;

exports.checkAvailability = async (request) => {

try {
    const db = await dbConnect();
    const totalBookingByMonth = await connection.db.collection('bookings').find().toArray();
    const checkMaintenanceRoomMode = await connection.db.collection('maintenance').find().toArray();
    // console.log(totalBookingsByMonth)
    // console.log(checkMaintenanceM)
}catch(error){
    status = false
    message = error.message
}

let response  = {status, data,message}
}