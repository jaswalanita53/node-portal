const { dbConnect } = require("../../common/dbConnect");
let status, data
exports.deleteInterval = (async (request) => {
   
    selectedTab = request.selectedTab;
    deleteId = request.deleteId;
    console.log('deleteId', deleteId)
    console.log('selectedTab', selectedTab)
    const selectedRoom = selectedTab.replace(/\bRoom\b/, '');
    console.log("$", selectedRoom, "$")
    try {
        const connection = await dbConnect();
        const collection = connection?.db.collection('finalRoomsPrice');  
        const result = await collection.findOne({ "roomName": selectedRoom.trim() })
            let newIntervalsArray = [];
            let promise1 = new Promise((res, rej) => {
                result.intervals.forEach(res1 => {
                    if (res1.intervalName.trim() !== deleteId.trim()) {
                        newIntervalsArray.push(res1)
                    }
                })
                res('done')
            })

            promise1.then(async () => {
                console.log("wew are here")
                let filter = { "roomName": selectedRoom.trim() }
                const options = { $set: { intervals: newIntervalsArray } }
                const result1 = await collection.updateOne(filter, options)
                console.log(result1)

                status = result1.modifiedCount > 0; // Check if any document was deleted
                
                result1 ? (status = true) : (status = false);
                status
                  ? (message = "Deleted successfully")
                  : (message = "No document was deleted. There is some error");
            })
    } catch (error) {
        status = false;
        message = error.message;
    }
    let response = { status, message };
    return response;
})