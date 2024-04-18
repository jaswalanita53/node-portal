const { dbConnect } = require("../../common/dbConnect");
let status, data
exports.getInterval = (async(request)=>{
    const selectedTab = request.selectedTab;
    selectedRoom = selectedTab.replace(/\bRoom\b/, '').trim();
    const selectedTabs = selectedTab.trim();
    console.log('this is api data',selectedTabs)
    try{
        // let query = { 'roomName': 'Deluxe test' }
        let query = { 'roomName': selectedRoom }
        const connection = await dbConnect();
        const roomDetails = await connection.db.collection('finalRoomsPrice').find(query).toArray()
        console.log('this is api data roomDetails',roomDetails)
        roomDetails.length > 0 ? status = true : status = false
        status == true ? data = roomDetails[0].intervals : data = null
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
});