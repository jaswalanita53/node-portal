 const { ObjectID } = require("mongodb");
const { dbConnect } = require("../../common/dbConnect")
let status, data
             
exports.updateData = async (request) =>{
    console.log('request apiiii',request)
    const price = request.value;
    const numericPrice = parseFloat(price);
    const rowId = request.rowId;
    const roomType = request.roomType;
    try{
        let connection = await dbConnect()
        // const result =   await connection.db.collection("rooms").updateOne({_id:  ObjectID(rowId) },{$set: { 
        //     pricePerNight: price } })
        const result =   await connection.db.collection("finalRoomsPrice").updateOne({roomName: (roomType) },{$set: { defaultPrice: numericPrice } })

            console.log('result',result)
            if (result.modifiedCount > 0) {                                                  
                status = true
                message = 'Data updated successfully'
              } else {
                status = false
                message = 'Data not found or not modified'
                                                                          
              }
    }catch (error) {
        status = false
        message = error.message
        console.log(error)
    }

    let response = { status, message }
    return response;

}