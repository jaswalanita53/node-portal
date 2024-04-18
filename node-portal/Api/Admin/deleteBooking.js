const { ObjectId } = require("mongodb");
const { dbConnect } = require("../../common/dbConnect")
const jwt = require('jsonwebtoken');


exports.deleteBooking = async (request) => {
  
 

    if (!request.id) {
        // console.log("this is run")
        return { error: 'Bad Request', message: 'No id provided', status:400 };
    }
    let status, data
    let response;
    try{
        const connection = await dbConnect();
        let deletebooking = await connection.db.collection("bookings").deleteOne({_id:ObjectId(request.id)})
        // console.log(deletebooking,"adddddd");
        deletebooking.deletedCount>0 ? status = true : status = false;
        status == true ? message = "Booking Deleted Successfully !" : message = deletebooking.deletedCount===0?"Id passed does not exist or already deleted":"Something Went Wrong Please Try again!!";
    } catch (error) {
        status = false
        message = error.message
    }
    response = { status, data, message }
    return response
}