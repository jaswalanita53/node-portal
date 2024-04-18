const { dbConnect } = require("../../common/dbConnect")
let status, data

exports.getRooms = async () =>{
    try{
        const connection = await dbConnect()
        let getRooms = await connection.db.collection("rooms").find().toArray();
        const result = await connection.db.collection("finalRoomsPrice").find().toArray();

        getRooms.map(rooms=>{
            result.map(item=>{
                if(rooms['roomName']===item['roomName']){
                    //console.log('defaultPrice---->>>',item['defaultPrice']);
                    rooms['totalPrice']=item['defaultPrice']
                }
            })
        })
        
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