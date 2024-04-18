const { dbConnect } = require("../../common/dbConnect");
let status, data
exports.updateInterval = (async (request) => {
    selectedTab = request.selectedTab;
    editId = request.editId;
    const selectedRoom = selectedTab.replace(/\bRoom\b/, '');
    try {
        const connection = await dbConnect();
        console.log('editId', editId)
        const filter = { roomName: selectedRoom.trim(), 'intervals.intervalName': editId };
        const updateDocument = {
            $set: {
                'intervals.$.intervalName': request.intervalName,
                'intervals.$.startDate': request.startDate,
                'intervals.$.endDate': request.endDate,
                'intervals.$.minLos': request.minLos,
                'intervals.$.maxLos': request.maxLos,
                'intervals.$.commonPrice': request.commonPrice,
                'intervals.$.mon': request.mon,
                'intervals.$.tue': request.tue,
                'intervals.$.wed': request.wed,
                'intervals.$.thu': request.thu,
                'intervals.$.fri': request.fri,
                'intervals.$.sat': request.sat,
                'intervals.$.sun': request.sun
            },
        };
        const result = await connection.db.collection("finalRoomsPrice").updateOne(filter, updateDocument);

        result ? (status = true) : (status = false);
        status
            ? (message = "Updated successfully")
            : (message = "There is some error");

    } catch (error) {
        status = false;
        message = error.message;
    }
    let response = { status, message };
    return response;
})