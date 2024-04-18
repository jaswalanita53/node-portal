const { dbConnect } = require("../../common/dbConnect")
let status, data
exports.editInterval = async (request)=>{
    const selectedTab = request.selectedTab;
    const editId = request.editId.trim();
    selectedRoom = selectedTab.replace(/\bRoom\b/, '').trim();
    const selectedTabs = selectedTab.trim();

    const projection = {
        'intervals.$': 1
      };
      
    try{
        let query = { 'roomName': selectedRoom,'intervals.intervalName': editId }
        const connection = await dbConnect();
        const roomDetails = await connection.db.collection('finalRoomsPrice').find(query).project(projection).toArray()
        console.log('roomDetailsssss',roomDetails);
        roomDetails.length > 0 ? status = true : status = false
        status == true ? data = roomDetails[0].intervals : data = null

        // roomDetails.length > 0 ? status = true : status = false
        // status == true ? data = roomDetails[0].intervals : data = null
        // if (roomDetails.length > 0) {
        //     const intervals = roomDetails[0].intervals;
        //     data=intervals
        // }
    }catch(error){
        status = false
        data = error.message
    }
    let response = { status, data }
    return response;
}