const { dbConnect } = require("../../common/dbConnect")
let status, data

exports.getRoomTypeById = async (request) =>{
    var ObjectId = require('mongodb').ObjectId;
    // console.log(request)
    const propertyKey = request?.propertyKey
    // const roomType = new ObjectId(request?.roomTypes)
    const roomType = request?.roomTypes

    try{
        const connection = await dbConnect()
        const query = {propertyKey:propertyKey,roomType:roomType}
        // console.log(query,"query")
        let getRooms = await connection.db.collection("rooms").find(query).toArray();
        // console.log(getRooms,"++++++++++++++")
        getRooms.length > 0 ? status = true : status = false
        status == true ? data = getRooms : data = getRooms
        await connection.client.close()
    }catch(error){
        status = false
        data = error.message
    }

    let response = { status, data }
    return response;
}