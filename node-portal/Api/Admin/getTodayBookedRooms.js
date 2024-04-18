const { dbConnect } = require("../../common/dbConnect");
let status, message, data;

exports.getTodayBookedRooms = async (recieveddate) => {
    try {
        console.log("received dates", recieveddate);
        console.log("getTodayBookedRooms");
        const connection = await dbConnect();
        const aggregation1 = [{
            $match: {
                date: recieveddate.currentDate
            }
        }, {
            $project: {
                date: 1,
                roomName: 1,
                roomData: 1
            }
        }, {
            $lookup: {
                from: "finalRoomsPrice",
                localField: "roomName",
                foreignField: "roomName",
                as: "roomExtraData"
            }
        }
       
    ]

        const aggregation2 = [
            {
                $match:{
                        checkInDate:recieveddate.currentDate
                }
            },
            {
                $project:{
                        "bookingID":1,
                        "roomKeys":1
            }
            },
              {
                $unwind: "$roomKeys"
              },
              {
                $project: {
                  _id: 0,
                  bookingID: 1,
                  bookedRoomNumbers: "$roomKeys.bookedRoomNumbers"
                }
              },{$unwind:"$bookedRoomNumbers"},{
                $group: {
                  _id: "$bookingID",
                  bookedRoomNumbers: { $push: "$bookedRoomNumbers" }
                }
              }
        ]
        const result = await connection.db.collection("roomsOccupancyByDates").aggregate(aggregation1).toArray();
        const result2 = await connection.db.collection("bookings").aggregate(aggregation2).toArray();
     
        console.log("this is the focus!!!",result);
  
        data = { result, result2 }
        result ? (status = true) : (status = false);
        status ? (message = "data fetched successfully") : (message = "there is some error");
    } catch (error) {
        status = false;
        message = error.message;
    }
    let response = { status, message, data };
    return response;
};
