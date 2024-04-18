const { dbConnect } = require("../../common/dbConnect");
let status, data, message;

exports.getAvailableOccupiedHoldToday = async (content) => {
  try {
    const connection = await dbConnect();
    const aggregationToFindAllTypesOfRoomsAvailableToday = [
      {
        $match: {
          $expr: {
            $and: [
              {
                $lte: [
                  {
                    $dateFromString: {
                      dateString: "$checkInDate",
                      format: "%Y-%m-%d",
                    },
                  },
                  new Date(content.id),
                ],
              },
              {
                $gt: [
                  {
                    $dateFromString: {
                      dateString: "$checkOutDate",
                      format: "%Y-%m-%d",
                    },
                  },
                  new Date(content.id),
                ],
              },
            ],
          },
        },
      },
      {
        $project: {
          roomKeys: 1,
        },
      },
      {
        $unwind: "$roomKeys",
      },
      {
        $group: {
          _id: "$roomKeys.id",
          totalRooms: { $sum: "$roomKeys.noOfRooms" },
        },
      },
      {
        $addFields: {
          roomKeyId: { $toObjectId: "$_id" },
        },
      },
      {
        $lookup: {
          from: "rooms",
          localField: "roomKeyId",
          foreignField: "_id",
          as: "roomDetails",
        },
      },
      {
        $project: {
          _id: 1,
          totalRooms: 1,
          roomDetails: {
            roomName: 1,

            totalNumberOfRooms: 1,
          },
        },
      },
      {
        $unwind: "$roomDetails",
      },
    ];

      var today = new Date();
    var formattedDate = today.toISOString().split('T')[0];

    const aggregateToFindAllTypesofRoomsinMaintenance = ([
  {
    $match: {
      createdAt: content.id
    }
  },
   {
        $addFields: {
          roomTypeIdstring: { $toObjectId: "$roomTypeId" },
        },
      },
      {
        $lookup:{
          from:"roomsTypes",
          localField:"roomTypeIdstring",
          foreignField:"_id",
          as :"roomName"
        }
      },
      {
        $unwind:"$roomName"
      },{
        $project:{
          createdAt:1,
          roomNumber: '2',
          roomName: "$roomName.roomType"
        }
      },{
        $addFields:{
          numberofRooms:1
        }
      },
      {
    $group: {
      _id: "$roomName",
      numberofRooms: { $sum: "$numberofRooms" }
    }
  },
  {
    $lookup:{
      from:"rooms",
      localField:"_id",
      foreignField:"roomName",
      as: "totalNumberofrooms"
    }
  },
  {
    $project:{
      numberofRooms: 1,
      totalNumberofrooms: "$totalNumberofrooms.totalNumberOfRooms"
    }
    },
    {
    $unwind:'$totalNumberofrooms'
    }
])

  let totalnumberofalltypesofrooms = await connection.db.collection("rooms").aggregate([
  {
    $group: {
      _id: null,
      totalNumberofRooms: { $sum: "$totalNumberOfRooms" }
    }
  }
]).toArray();

let totalrooms = totalnumberofalltypesofrooms[0].totalNumberofRooms

    const getAvailableRooms = await connection.db.collection("bookings").aggregate(aggregationToFindAllTypesOfRoomsAvailableToday).toArray();

    let totalpercentageofavailable = 0
    getAvailableRooms.map((value)=>{
      totalpercentageofavailable = totalpercentageofavailable + value.totalRooms
    })

    let percentageofRoomsBooked=totalpercentageofavailable/totalrooms*100;
   
    const getmaintenance = await connection.db.collection("maintenance").aggregate(aggregateToFindAllTypesofRoomsinMaintenance).toArray()
    // console.log(getmaintenance,"@@@@")
    let totalpercentageofmaintenance = 0
    let totalRoomsinmaintenance = 0
    getmaintenance.map((value)=>{
      totalRoomsinmaintenance = value.numberofRooms + totalRoomsinmaintenance
    })

    let percentageofroomsinmaintenance = totalRoomsinmaintenance/totalrooms*100;

    let availableRooms = 100
    let maintenance = percentageofroomsinmaintenance?percentageofroomsinmaintenance:0
    let roomsbooked = percentageofRoomsBooked?percentageofRoomsBooked:0
    availableRooms = availableRooms - maintenance  - roomsbooked
    data = {"availableRooms":availableRooms,"percentageofroomsinmaintenance":(percentageofroomsinmaintenance?percentageofroomsinmaintenance:0),"percentageofRoomsBooked":(percentageofRoomsBooked?percentageofRoomsBooked:0)}
    data?status=true:status=false;
    message = "roomdata has been fetched";

  } catch (error) {
    status = false;
    message = error.message;
  }

  let response = { status, data , message };
  return response;
};