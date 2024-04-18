const e = require("cors");
const {
  dbConnect
} = require("../../common/dbConnect");

exports.getAvailableRooms = async (request) => {
  // console.log(request.params)
  // console.log(request.query)
  // console.log(request.params.id)
  // const propertyKey = request?.propertyKey
  let year= request.params.id.split("-")[0]
  let month= +request.params.id.split("-")[1] - 1
  let day= request.params.id.split("-")[2]
  let status, data;
  // let month = request.params.id - 1;
  try {
    const connection = await dbConnect();

    let aggregate1 = [{
        $project: {
          _id: 1,
          checkInDate: 1,
          checkOutDate: 1,
          totalDays: 1,
          roomKeys: 1,
        },
      },
      {
        $unwind: {
          path: "$roomKeys",
        },
      },
      {
        $lookup: {
          from: "rooms",

          let: {
            roomId: {
              $convert: {
                input: "$roomKeys.id",
                to: "objectId",
              },
            },
          },
          pipeline: [{
            $match: {
              $expr: {
                $eq: ["$_id", "$$roomId"],
              },
            },
          }, ],

          as: "roomDetails",
        },
      },
      {
        $project: {
          _id: 1,
          checkInDate: 1,
          checkOutDate: 1,
          totalDays: 1,
          roomKeys: 1,
          roomDetails: {
            roomName: 1,
          },
        },
      },
      {
        $unwind: {
          path: "$roomDetails",
        },
      },
    ];

    let aggregate2 = [{
      $project: {
        roomTypeId: 1
      }
    },
    {
      $lookup: {
        from: "roomsTypes",
        let: {
          roomId: {
            $convert: {
              input: "$roomTypeId",
              to: "objectId",
            },
          },
        },
        pipeline: [{
          $match: {
            $expr: {
              $eq: ["$_id", "$$roomId"],
            },
          },
        }, ],

        as: "roomDetails",
      }
    }, {
      $project: {
        roomDetails: 1
      }

    }, {
      $unwind: {
        path: "$roomDetails"

      }
    }

    ]

    let bookingsdata = await connection.db
      .collection("bookings")
      .aggregate(aggregate1)
      .toArray();

    let maintenancedata = await connection.db.collection("maintenance").aggregate(aggregate2).toArray();
    let totalRoomsData = {};
    const getRoomsdata = async () => {
      let connection = await dbConnect();
      let data = await connection.db.collection("rooms").find().toArray();
      let totalRooms = {};
      data.map((value) => {
        totalRooms[value.roomName] = value.totalNumberOfRooms;
      });

      totalRoomsData = totalRooms;

    };

    let result = {};
    let result1 = await getRoomsdata().then(() => {
      const getbookings = (date) => {
        let res = Object.assign({}, totalRoomsData);
        let checkdateString = date;
        
        bookingsdata.map((value) => {
          let date1 = new Date(value.checkInDate);
          let date2 = new Date(value.checkOutDate);
          let checkdate = new Date(checkdateString);
       
          if (checkdate >= date1 && checkdate < date2) {
            res[value.roomDetails.roomName] =
              res[value.roomDetails.roomName] - value.roomKeys.noOfRooms;
          }
        });
        
        result[checkdateString] = res;
       
        maintenancedata.map((value) => {
          if (value.createdAt === checkdateString) {
            result[checkdateString][value.roomType] = result[checkdateString][value.roomType] - 1
          }
        })
      
      }

      // function getDaysInMonth(month, year,date) {
      //   var date = new Date(year, month, date);
      //   var days = [];
      //   while (date.getMonth() === month) {
      //     days.push(new Date(date).toISOString().split("T")[0]);
      //     date.setDate(date.getDate() + 1);
      //   }

      //   return days;
      // }

      const startDate = new Date(year, month, day); // May 15, 2023
      const next30Days = [];

      for (let i = 0; i < 30; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i);
          next30Days.push(currentDate.toISOString().split("T")[0]);
      }

      next30Days.map((value)=> getbookings(value))

      // let datesArray = getDaysInMonth(month, 2023, 12);
      // datesArray.map((value) => {
      //   getbookings(value);
      // });
    }).then(() => {

      result ? status = true : status = false
      status == true ? data = result : data = result
      return true
    })

    let response = {}

    if (result1) {
   
      response = {
        status,
        data
      }

    }
    
    return response
  } catch (error) {
    console.log(error)
    data = error
    status = false
    return {
      data,
      status
    }
  }


};