const { dbConnect } = require("../../common/dbConnect");
let status, data
exports.saveInterval=(async(request)=>{
selectedTab = request.selectedTab;
editId = request.editId;
const selectedRoom = selectedTab.replace(/\bRoom\b/, '');
try{
    const connection = await dbConnect();
    const collection = connection?.db.collection('finalRoomsPrice');
    const filter = { roomName: selectedRoom.trim() };
    const intervalsToAdd = [request]; // Replace this with your actual array

    const updateDocument = {
    $push: { intervals: { $each: intervalsToAdd } },
    };

    const result = await connection.db.collection("finalRoomsPrice").updateOne(filter, updateDocument);
 
    result ? (status = true) : (status = false);
    status
      ? (message = "Added successfully ")
      : (message = "There is some error");
  
}catch(error){
    status = false;
    message = error.message;
}
let response = { status, message };
return response;
})