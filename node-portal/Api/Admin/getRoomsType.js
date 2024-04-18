const { dbConnect } = require("../../common/dbConnect")
let status, data

exports.getRoomsType = async () =>{
    try{
        const connection = await dbConnect()
        let getRoomsTypes = await connection.db.collection("roomsTypes").find().toArray();
        getRoomsTypes.length > 0 ? status = true : status = false
        status == true ? data = getRoomsTypes : data = getRoomsTypes
        await connection.client.close()
    }catch(error){
        status = false
        data = error.message
    }

    let response = { status, data }
    return response;

}