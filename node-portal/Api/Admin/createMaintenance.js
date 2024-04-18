const { ObjectId } = require("mongodb")
const { dbConnect } = require("../../common/dbConnect")
let status, message

exports.createMaintenance = async (request) => {
    let requestedData = request
    // console.log(request,"requesteddata")
    const { propertyId, roomTypeId, roomNumber, } = requestedData
    // if (!propertyId || !roomTypeId || !roomNumber){
    //     return { error: 'Bad Request', message: 'Please provide all required data', status: 400 };
    // }
    try {
        let connection = await dbConnect()
        let findMaintenance = await connection.db.collection("maintenance").findOne({ propertyId: ObjectId(propertyId), roomTypeId: ObjectId(roomTypeId) , roomNumber , createdAt: new Date().toISOString().split("T")[0] });
        // console.log(findMaintenance,"##########")
       if( findMaintenance ) {
           status = false
            message = "Maintenance already exists for provided room id, room number on provided date ";
       } else{
           let createMaintenance = await connection.db.collection("maintenance").insertOne(
               { propertyId: ObjectId(propertyId), roomTypeId: ObjectId(roomTypeId), roomNumber, createdAt: new Date().toISOString().split("T")[0] })
        //    console.log(createMaintenance,"%%%%%%%%")
           createMaintenance ? status = true : status = false
           status ? message = "Maintenance Created successfully !!" : message = "Maintenance Created unsuccessfully";
        }
    } catch (error) {
        status = false
        message = error.message
    }

    let response = { status, message }
    return response;
}