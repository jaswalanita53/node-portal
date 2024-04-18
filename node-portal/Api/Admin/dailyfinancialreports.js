const { dbConnect } = require("../../common/dbConnect");
let status, data, message;

exports.dailyfinancialreports = async (content) => {
  
  let date1 = new Date(content.id);
  date1.setDate(2);
  //date1 is the second date of content.id month 
  let date2 = new Date(content.id);
  date2.setDate(1);
  date2 = date2.toISOString().split("T")[0];
  //date2 is the fisrt date of content.id month 

  date1 = date1.toISOString().split("T")[0];
  let givendate = new Date(content.id);
  givendate = givendate.toISOString().split("T")[0];
  // givendate is the today date 

  const givenDate2 = new Date(content.id); 
  // Get the year and month from the given date
  const year = givenDate2.getFullYear();
  const month = givenDate2.getMonth();
  // Create a new date object for the first day of the next month
  const firstDayNextMonth = new Date(year, month + 1, 1);
  // Subtract one day from the first day of the next month to get the last day of the given month
  const lastDayCurrentMonth = new Date(firstDayNextMonth - 1);
  // Extract the number of days
  const numberOfDays = lastDayCurrentMonth.getDate();
  // console.log(numberOfDays, "this is the numberof dayss@@@@@@@@@@@@@@@@@@@@@@@@@@");
  let startdate = new Date(content.id);
  startdate = startdate.setDate(1)

  startdate = new Date(startdate)
  startdate = startdate.toISOString().split("T")[0]


  let nextmonthfirstdate = new Date(startdate)
  currentmonth = nextmonthfirstdate.getMonth();
  nextmonthfirstdate.setMonth(currentmonth +1)
  nextmonthfirstdate = nextmonthfirstdate.toISOString().split("T")[0];
  // console.log(nextmonthfirstdate,"nextmonthfirstdate")

  try {
    const connection = await dbConnect();

    let aggregateToGetBookedRoomsOfaMonth = ([
      {
        $match: {
          checkOutDate: {
            $gte: date1,
            $lte: nextmonthfirstdate,
          },
        },
      },
      {
        $project: {
          checkInDate: 1,
          checkOutDate: 1,
          totalDays: 1,
          roomKeys: 1,
        }
      },
      {
        $unwind: "$roomKeys",
      },
      {
        $addFields: {
          roomkeyobjid: { $toObjectId: "$roomKeys.id" },
        },
      },
      {
        $lookup: {
          from: "rooms",
          foreignField: "_id",
          localField: "roomkeyobjid",
          as: "roomsdata",
        },
      },
      {
        $project: {
          checkInDate: 1,
          checkOutDate: 1,
          totalDays: 1,
          noOfRooms: "$roomKeys.noOfRooms",
          roomsdata: "$roomsdata.roomName",
        },
      },
      {
        $unwind: "$roomsdata",
      },
      {
        $addFields: {
          totalDays: { $toInt: "$totalDays" },
          noOfRooms: { $toInt: "$noOfRooms" },
        },
      },
      {
        $project: {
          product: {
            $multiply: ["$totalDays", "$noOfRooms"],
          },
          checkInDate: 1,
          checkOutDate: 1,
          totalDays: 1,
          noOfRooms: 1,
          roomsdata: 1,
        },
      },
      {
        $group: {
          _id: "$roomsdata",
          product: { $sum: "$product" },
        },
      },
    ])

    let aggregateToFindTotalRoomsInMaintenanceForGivenMonth = [
      {
        $match: {
          createdAt: {
            $gte: date2,
            $lt: givendate,
          },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },

      {
        $project: {
          _id: 0,
          count: 1,
        },
      },
    ];

    let bookedroomsmonthdata = await connection.db
      .collection("bookings")
      .aggregate(aggregateToGetBookedRoomsOfaMonth)
      .toArray();

    // console.log(bookedroomsmonthdata, "bookedroomsmonthdata")
 

    let totalBookedRooms = 0;
    bookedroomsmonthdata.map((value) => {
      totalBookedRooms = totalBookedRooms + value.product;
    });

    // console.log(totalBookedRooms, "totalBookedRooms");

    let totalnumberofalltypesofrooms = await connection.db
      .collection("rooms")
      .aggregate([
        {
          $group: {
            _id: null,
            totalNumberofRooms: { $sum: "$totalNumberOfRooms" },
          },
        },
      ])
      .toArray();

    let totalroomsinoneday = totalnumberofalltypesofrooms[0].totalNumberofRooms;
    // console.log(totalroomsinoneday, "asdsadsa");
    let totalroomsingivenmonth = totalroomsinoneday * numberOfDays;
    // console.log(totalroomsingivenmonth, "asdsadsa");

    let percentageofroomsbookedinmonth =
      (totalBookedRooms / totalroomsingivenmonth) * 100;
    // console.log(percentageofroomsbookedinmonth,"percentageofroomsbookedinmonth");

    let totalroomsinmaintenance = await connection.db
      .collection("maintenance")
      .aggregate(aggregateToFindTotalRoomsInMaintenanceForGivenMonth)
      .toArray();
    // console.log(totalroomsinmaintenance[0].count,"this is the number of total rooms in maintenance");
          // console.log(totalroomsinmaintenance,"totalroomsinmaintenance")
          // console.log("thsisi sasdabsdhj!!!!!!!!!!!!")
          // console.log(totalroomsingivenmonth,"totalroomsingivenmonth")

          totalroomsinmaintenance = totalroomsinmaintenance.length === 0?0:totalroomsinmaintenance[0].count
          // console.log(totalroomsinmaintenance,"totalroomsinmaintenance")
    let percentageofroomsinmaintenancefowholemonth =
      (totalroomsinmaintenance / totalroomsingivenmonth) * 100;
      // console.log(percentageofroomsinmaintenancefowholemonth,"percentageofroomsinmaintenance")
      // console.log("thsisi sasdabsdhj")
    let roomsbookedinwholemonth = percentageofroomsbookedinmonth
      ? percentageofroomsbookedinmonth
      : 0;
    let roominmaintenance = percentageofroomsinmaintenancefowholemonth
      ? percentageofroomsinmaintenancefowholemonth
      : 0;
    let availableRoomsinwholemonth = 100 - roomsbookedinwholemonth - roominmaintenance;
    // console.log(availableRoomsinwholemonth, "availableRoomsinwholemonth");

    // console.log(roominmaintenance, "roominmaintenance");

    let occupancyRateMonthData = {
      availableRooms: Number(availableRoomsinwholemonth.toFixed(2)),
      percentageofroomsinmaintenance: Number(roominmaintenance.toFixed(2)),
      percentageofRoomsBooked: Number(roomsbookedinwholemonth.toFixed(2)) ,
    };

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


let totalrooms = totalnumberofalltypesofrooms[0].totalNumberofRooms

    const getAvailableRooms = await connection.db.collection("bookings").aggregate(aggregationToFindAllTypesOfRoomsAvailableToday).toArray();

    let totalpercentageofavailable = 0
    getAvailableRooms.map((value)=>{
      totalpercentageofavailable = totalpercentageofavailable + value.totalRooms
    })

    let percentageofRoomsBooked=totalpercentageofavailable/totalrooms*100;
   
    const getmaintenance = await connection.db.collection("maintenance").aggregate(aggregateToFindAllTypesofRoomsinMaintenance).toArray()

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
    let occupancyratetodaydata = {"availableRooms":availableRooms,"percentageofroomsinmaintenance":(percentageofroomsinmaintenance?percentageofroomsinmaintenance:0),"percentageofRoomsBooked":(percentageofRoomsBooked?percentageofRoomsBooked:0)}
    const aggregationtofindtotalpersonforaday = [
      {
        $match: {
          checkInDate: { $lte: content.id }, // Replace with your provided date
          checkOutDate: { $gt: content.id }, // Replace with your provided date
        },
      },
      {
        $project: {
          noOfPerson: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalnoofPerson: { $sum: "$noOfPerson" },
        },
      },
    ];

    const aggregationToFindTotalNumberofcheckInsForaGivenDate = [
      {
        $match: {
          checkInDate: content.id,
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ];

    const aggregationToFindTotalNumberofCheckoutsForAGivenDate = [
      {
        $match: {
          checkOutDate: content.id,
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ];

    const aggToFindtotalGuestmonthtodate = [
      {
        $match: {
          checkInDate: { $gte: startdate }, // Replace with your provided date
          checkOutDate: { $lt: content.id }, // Replace with your provided date
        },
      },
      {
        $project: {
          noOfPerson: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalnoofPerson: { $sum: "$noOfPerson" },
        },
      },
    ];

    const aggToFindTotalCheckInsMonthtodate = [
      {
        $match: {
          checkInDate: {
            $gte: startdate, // Replace with your provided date
            $lt: givendate,
          }, // Replace with your provided date
        },
      },
      {
        $project: {
          checkInDate: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalCheckIns: { $sum: 1 },
        },
      },
    ];

    const aggToFindTotalCheckOutsMonthtodate = [
      {
        $match: {
          checkOutDate: {
            $gte: startdate, // Replace with your provided date
            $lt: givendate,
          }, // Replace with your provided date
        },
      },
      {
        $project: {
          checkOutDate: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalCheckOuts: { $sum: 1 },
        },
      },
    ];

    const aggToFindwalkInforGivenDate = [
      {
        $match: {
          bookingDate: givendate,
          isWalkIn: true,
        },
      },
      {
        $group: {
          _id: 1,
          count: { $sum: 1 },
        },
      },
    ];

    const aggToFindwalkInsmonthtodate = [
      {
        $match: {
          bookingDate: {
            $gte: startdate,
            $lt: givendate,
          },
          isWalkIn: true,
        },
      },
      {
        $group: {
          _id: 1,
          count: { $sum: 1 },
        },
      },
    ];

    const aggToFindAvgLosForgivendate = [
      {
        $match: {
          bookingDate: givendate,
        },
      },
      {
        $project: {
          totalDays: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: "$totalDays" },
          noofBookings: { $sum: 1 },
        },
      },
      {
        $project: {
          avglosforgivendate: { $divide: ["$totalDays", "$noofBookings"] },
        },
      },
    ];

    const aggtoFindAvgLosmonthtodate = [
      {
        $match: {
          bookingDate: {
            $gte: startdate,
            $lt: givendate,
          },
        },
      },
      {
        $project: {
          totalDays: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: "$totalDays" },
          noofBookings: { $sum: 1 },
        },
      },
      {
        $project: {
          totalDays: 1,
          noofBookings: 1,
          avglosformonthtodate: { $divide: ["$totalDays", "$noofBookings"] },
        },
      },
    ];

    const aggtofindavglostotalnightsgivendate = [
      {
        $match: {
          bookingDate: givendate,
        },
      },
      {
        $project: {
          totalDays: 1,
          noOfPerson: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: "$totalDays" },
          noOfPerson: { $sum: "$noOfPerson" },
        },
      },
      {
        $project: {
          totalDays: 1,
          noOfPerson: 1,
          avglosnightsstayed: { $divide: ["$totalDays", "$noOfPerson"] },
        },
      },
    ];

    const aggtofindavglostotalnightsmonthtodate = [
      {
        $match: {
          bookingDate: {
            $gte: startdate,
            $lt: givendate,
          },
        },
      },
      {
        $project: {
          totalDays: 1,
          noOfPerson: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: "$totalDays" },
          noOfPerson: { $sum: "$noOfPerson" },
        },
      },
      {
        $project: {
          totalDays: 1,
          noOfPerson: 1,
          avglosnightsstayed: { $divide: ["$totalDays", "$noOfPerson"] },
        },
      },
    ];

    const aggtofindadrforgivendateperguest = [
      {
        $match: {
          checkInDate: { $lte: "2023-05-25" },
          checkOutDate: { $gt: "2023-05-25" },
        },
      },
      {
        $project: {
          totalPrice: 1,
          noOfRooms: 1,
          totalDays: 1,    
          checkInDate: 1,
          checkOutDate: 1,
          noOfPerson: 1,
        },
      },
      {   
        $project: {
          totalPrice: {
            $divide: [
              { $toDouble: "$totalPrice" },
              { $toDouble: "$totalDays" },
            ],
          },
          checkInDate: 1,
          checkOutDate: 1,
          noOfRooms: 1,
          noOfPerson: 1,
        },
      },
      {
        $project: {
          checkInDate: 1,
          checkOutDate: 1,
          final: { $divide: ["$totalPrice", "$noOfRooms"] },
          noOfPerson: 1,
        },
      },
      {
        $group: {
          _id: null,
          noOfPerson: { $sum: "$noOfPerson" },
          final: { $sum: "$final" },
        },
      },
      {
        $project: {
          givendateadr: {
            $divide: ["$final", "$noOfPerson"],
          },
        },
      },
    ];

    const aggtofindadrformonthtodateperguest = [
      {
        $match: {
          checkInDate: { $gte: startdate },
          checkOutDate: { $lt: givendate },
        },
      },
      {
        $project: {
          totalPrice: 1,
          noOfRooms: 1,
          totalDays: 1,
          checkInDate: 1,
          checkOutDate: 1,
          noOfPerson: 1,
        },
      },
      {
        $project: {
          totalPrice: {
            $divide: [
              { $toDouble: "$totalPrice" },
              { $toDouble: "$totalDays" },
            ],
          },
          checkInDate: 1,
          checkOutDate: 1,
          noOfRooms: 1,
          noOfPerson: 1,
        },
      },
      {
        $project: {
          checkInDate: 1,
          checkOutDate: 1,
          final: { $divide: ["$totalPrice", "$noOfRooms"] },
          noOfPerson: 1,
        },
      },
      {
        $group: {
          _id: null,
          noOfPerson: { $sum: "$noOfPerson" },
          final: { $sum: "$final" },
        },
      },
      {
        $project: {
          monthtodateadr: {
            $divide: ["$final", "$noOfPerson"],
          },
        },
      },
    ];

    // console.log(givendate,"@@@@@@@@@@@@@@@@@givendata")
    const aggtofindtotalrevenueforgivendate = [
      {
        $match: {
          checkInDate: { $lte: givendate },
          checkOutDate: { $gt: givendate },
        },
      },
      {
        $project: {
          noOfRooms: 1,
          totalPrice: 1,
          totalDays: 1,
          checkInDate: 1,
          checkOutDate: 1,
        },
      },
      {
        $project: {
          totalPrice: {
            $divide: [
              { $toDouble: "$totalPrice" },
              { $toDouble: "$totalDays" },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalPrice: { $sum: "$totalPrice" },
        },
      },
    ];

    // console.log(startdate,"####################################")
    const aggtofindtotalrevenuemonthtodate = [
      {
        $match: {
          checkInDate: { $lt: givendate },
          checkOutDate: { $gt: startdate },
        },
      },
      {
        $project: {
          noOfRooms: 1,
          totalPrice: 1,
          totalDays: 1,
          checkInDate: 1,
          checkOutDate: 1,
        },
      },
      {
        $project: {
          totalPrice: 1,
          totalDays: 1,
          result: {
            $cond: {
              if: { $lt: ["$checkInDate", startdate] },
              then: {
                $dateDiff: {
                  startDate: { $toDate: startdate },
                  endDate: { $toDate: "$checkOutDate" },
                  unit: "day",
                },
              },
              else: {
                $cond: {
                  if: {
                    $gt: ["$checkOutDate", givendate],
                  },
                  then: {
                    $dateDiff: {
                      startDate: { $toDate: "$checkInDate" },
                      endDate: { $toDate: givendate },
                      unit: "day",
                    },
                  },
                  else: "$totalDays",
                },
              },
            },
          },
        },
      },
      {
        $project: {
          totalPrice: 1,
          result: {
            $divide: [{ $toDouble: "$totalDays" }, { $toDouble: "$result" }],
          },
        },
      },
      {
        $project: {
          totalPrice: 1,
          result: {
            $divide: [{ $toDouble: "$totalPrice" }, { $toDouble: "$result" }],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenueformonthtodate: { $sum: "$result" },
        },
      },
    ];

    const aggregateToFindPaymentForGivenDate = [
      {
        $match: { bookingDate: givendate },
      },
      {
        $project: {
          totalPrice: 1,
        },
      },
      {
        $group: {
          _id: null,
          paymentforgivendate: { $sum: "$totalPrice" },
        },
      },
    ];

    const aggregateToFindAdrForGivenDate = [
      {
        $match: {
          checkInDate: { $lte: givendate },
          checkOutDate: { $gt: givendate },
        },
      },
      {
        $project: {
          noOfRooms: 1,
          totalPrice: 1,
          totalDays: 1,
        },
      },
      {
        $project: {
          noOfRooms: 1,
          totalPrice: {
            $divide: [{ $toDouble: "$totalPrice" }, "$totalDays"],
          },
        },
      },
      {
        $group: {
          _id: null,
          noOfRooms: { $sum: "$noOfRooms" },
          totalPrice: { $sum: "$totalPrice" },
        },
      },
      {
        $project: {
          adrgivendate: { $divide: ["$totalPrice", "$noOfRooms"] },
          totalPrice:1
        },
      },
    ];

    const aggregateToFindAdrMonthToDate = [
      {
        $match: {
          checkInDate: { $lt: givendate },
          checkOutDate: { $gt: startdate },
        },
      },
      {
        $project: {
          noOfRooms: 1,
          totalPrice: { $toDouble: "$totalPrice" },
          checkInDate: 1,
          checkOutDate: 1,
          totalDays: 1,
          totalDaydiff: {
            $cond: {
              if: { $lt: ["$checkInDate", startdate] },
              then: {
                $dateDiff: {
                  startDate: { $toDate: startdate },
                  endDate: { $toDate: "$checkOutDate" },
                  unit: "day",
                },
              },
              else: {
                $cond: {
                  if: {
                    $gt: ["$checkOutDate", givendate],
                  },
                  then: {
                    $dateDiff: {
                      startDate: { $toDate: "$checkInDate" },
                      endDate: { $toDate: givendate },
                      unit: "day",
                    },
                  },
                  else: "$totalDays",
                },
              },
            },
          },
        },
      },
      {
        $project: {
          noOfRooms: 1,
          totalPrice: { $divide: ["$totalPrice", "$totalDays"] },
          totalDaydiff: 1,
        },
      },
      {
        $project: {
          noOfRooms: 1,
          totalPrice: { $multiply: ["$totalPrice", "$totalDaydiff"] },
        },
      },
      {
        $group: {
          _id: null,
          noOfRooms: { $sum: "$noOfRooms" },
          totalPrice: { $sum: "$totalPrice" },
        },
      },
      {
        $project: {
          adrmonthtodate: { $divide: ["$totalPrice", "$noOfRooms"] },
          totalPrice:1
        },
      },
    ];

    const aggregateToFindTotaloccupiedRoomsForADay = [
      {
        $match: {
          checkInDate: { $lte: givendate },
          checkOutDate: { $gt: givendate },
        },
      },
      {
        $project: {
          noOfRooms: 1,
        },
      },
      {
        $group: {
          _id: null,
          noOfRooms: { $sum: "$noOfRooms" },
        },
      },
    ];

    // here an aggregation to find total number of rooms available for a given date
    // this aggregation to be done on rooms collection
    const aggregatetofindTotalNumberofRoomsOfeachType = [
      {
        $project: {
          totalNumberOfRooms: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalRoomsOfeachType: { $sum: "$totalNumberOfRooms" },
        },
      },
    ];

    const aggregateToFindPaymentForMonthToDate = [
      {
        $match: {
          bookingDate: {
            $gte: startdate,
            $lt: givendate,
          },
        },
      },
      {
        $project: {
          totalPrice: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalPrice: {
            $sum: { $toDouble: "$totalPrice" },
          },
        },
      },
    ];

    const aggregateToFindTotalRoomsOccupiedForMonthToDate = ([
      {
        $match: {
          checkInDate: { $lt: givendate },
          checkOutDate: { $gt: startdate },
        },
      },
      {
        $project: {
          noOfRooms: 1,
          totalPrice: { $toDouble: "$totalPrice" },
          checkInDate: 1,
          checkOutDate: 1,
          totalDays: 1,
          totalDaydiff: {
            $cond: {
              if: { $lt: ["$checkInDate", startdate] },
              then: {
                $dateDiff: {
                  startDate: { $toDate: startdate },
                  endDate: { $toDate: "$checkOutDate" },
                  unit: "day",
                },
              },
              else: {
                $cond: {
                  if: {
                    $gt: ["$checkOutDate", givendate],
                  },
                  then: {
                    $dateDiff: {
                      startDate: { $toDate: "$checkInDate" },
                      endDate: { $toDate: givendate },
                      unit: "day",
                    },
                  },
                  else: "$totalDays",
                },
              },
            },
          },
        },
      },
      {
        $project: {
          noOfRooms: {
            $multiply: ["$noOfRooms", "$totalDaydiff"],
          },
        },
      },
      {
        $group: {
          _id: null,
          noOfRooms: { $sum: "$noOfRooms" },
        },
      },
    ])


 
    const aggregateToFindTotalRoomsOccupiedformonth =  ([
      {
        $match: {
          checkInDate: { $lte: givendate },
          checkOutDate: { $gt: startdate },
        },
      },
      {
        $project: {
          noOfRooms: 1,
          checkInDate: 1,
          checkOutDate: 1,
          totalDays: 1,
          totalDaydiff: {
            $cond: {
              if: { $lt: ["$checkInDate", startdate] },
              then: {
                $dateDiff: {
                  startDate: { $toDate: startdate },
                  endDate: { $toDate: "$checkOutDate" },
                  unit: "day",
                },
              },
              else: {
                $cond: {
                  if: {
                    $gt: ["$checkOutDate", nextmonthfirstdate],
                  },
                  then: {
                    $dateDiff: {
                      startDate: { $toDate: "$checkInDate" },
                      endDate: { $toDate: nextmonthfirstdate },
                      unit: "day",
                    },
                  },
                  else: "$totalDays",
                },
              },
            },
          },
        },
      },{
        $project:{
          noOfRooms:1,
          totalDays:1,
          totalDaydiff:1
        }
      },{
        $project:{
          noOfRooms:{$multiply:["$noOfRooms","$totalDaydiff"]}
        }
      },{$group:{
        _id:null,
        noOfRooms:{$sum:"$noOfRooms"}
      }}
    ])


    const aggregateToFindAdrForWholeMonth = [
      {
        $match: {
          checkInDate: { $lte: givendate },
          checkOutDate: { $gt: startdate },
        },
      },
      {
        $project: {
          noOfRooms: 1,
          totalPrice: { $toDouble: "$totalPrice" },
          checkInDate: 1,
          checkOutDate: 1,
          totalDays: 1,
          totalDaydiff: {
            $cond: {
              if: { $lt: ["$checkInDate", startdate] },
              then: {
                $dateDiff: {
                  startDate: { $toDate: startdate },
                  endDate: { $toDate: "$checkOutDate" },
                  unit: "day",
                },
              },
              else: {
                $cond: {
                  if: {
                    $gt: ["$checkOutDate", nextmonthfirstdate],
                  },
                  then: {
                    $dateDiff: {
                      startDate: { $toDate: "$checkInDate" },
                      endDate: { $toDate: nextmonthfirstdate },
                      unit: "day",
                    },
                  },
                  else: "$totalDays",
                },
              },
            },
          },
        },
      },
      {
        $project: {
          noOfRooms: 1,
          totalPrice: { $divide: ["$totalPrice", "$totalDays"] },
          totalDaydiff: 1,
        },
      },
      {
        $project: {
          noOfRooms: 1,
          totalPrice: { $multiply: ["$totalPrice", "$totalDaydiff"] },
        },
      },
      {
        $group: {
          _id: null,
          noOfRooms: { $sum: "$noOfRooms" },
          totalPrice: { $sum: "$totalPrice" },
        },
      },
      {
        $project: {
          adrWholeMonth: { $divide: ["$totalPrice", "$noOfRooms"] },
          totalPrice:1
        },
      },
    ];

    // here all the aggregations ends

    //  here are all the mongodb queries

    let totalGuests = await connection.db
      .collection("bookings")
      .aggregate(aggregationtofindtotalpersonforaday)
      .toArray();
    // console.log(totalGuests, "totalGuests");

    let totalCheckIns = await connection.db
      .collection("bookings")
      .aggregate(aggregationToFindTotalNumberofcheckInsForaGivenDate)
      .toArray();
    // console.log(totalCheckIns, "totalCheckIns");

    let totalCheckOuts = await connection.db
      .collection("bookings")
      .aggregate(aggregationToFindTotalNumberofCheckoutsForAGivenDate)
      .toArray();
    // console.log(totalCheckOuts, "totalCheckOuts");

    let totalGuestsmonthtodate = await connection.db
      .collection("bookings")
      .aggregate(aggToFindtotalGuestmonthtodate)
      .toArray();
    // console.log(totalGuestsmonthtodate, "totalGuestsmonthtodate");

    let totalcheckInsMonthtodate = await connection.db
      .collection("bookings")
      .aggregate(aggToFindTotalCheckInsMonthtodate)
      .toArray();
    // console.log(totalcheckInsMonthtodate, "totalcheckInsMonthtodate");

    let totalcheckOutsmonthtoDate = await connection.db
      .collection("bookings")
      .aggregate(aggToFindTotalCheckOutsMonthtodate)
      .toArray();
    // console.log(totalcheckOutsmonthtoDate, "totalcheckOutsmonthtoDate");

    let walkInforGivenDate = await connection.db
      .collection("bookings")
      .aggregate(aggToFindwalkInforGivenDate)
      .toArray();
    // console.log(walkInforGivenDate, "walkIns");

    let walkInforGivenDatemonthtodate = await connection.db
      .collection("bookings")
      .aggregate(aggToFindwalkInsmonthtodate)
      .toArray();
    // console.log(walkInforGivenDatemonthtodate, "walkInsmonthtodate");

    let avgLosForgivendate = await connection.db
      .collection("bookings")
      .aggregate(aggToFindAvgLosForgivendate)
      .toArray();
    // console.log(avgLosForgivendate, "avgLosForgivendate");

    let AvgLosmonthtodate = await connection.db
      .collection("bookings")
      .aggregate(aggtoFindAvgLosmonthtodate)
      .toArray();
    // console.log(AvgLosmonthtodate, "AvgLosmonthtodate");

    let avglostotalnightsgivendate = await connection.db
      .collection("bookings")
      .aggregate(aggtofindavglostotalnightsgivendate)
      .toArray();
    // console.log(avglostotalnightsgivendate, "avglostotalnightsgivendate");

    let avglostotalnightsmonthtodate = await connection.db
      .collection("bookings")
      .aggregate(aggtofindavglostotalnightsmonthtodate)
      .toArray();
    // console.log(avglostotalnightsmonthtodate, "avglostotalnightsmonthtodate");

    let adrforgivendateperguest = await connection.db
      .collection("bookings")
      .aggregate(aggtofindadrforgivendateperguest)
      .toArray();
    // console.log(adrforgivendateperguest, "adrforgivendate");

    let adrforemonthtodateperguest = await connection.db
      .collection("bookings")
      .aggregate(aggtofindadrformonthtodateperguest)
      .toArray();
    // console.log(adrforemonthtodateperguest, "adrforemonthtodate");

    let totalrevenueforgivendate = await connection.db
      .collection("bookings")
      .aggregate(aggtofindtotalrevenueforgivendate)
      .toArray();
    // console.log(totalrevenueforgivendate, "totalrevenueforgivendate");

    let totalrevenueformonthtodate = await connection.db
      .collection("bookings")
      .aggregate(aggtofindtotalrevenuemonthtodate)
      .toArray();
    // console.log(totalrevenueformonthtodate,"%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
      if(startdate === givendate){
        totalrevenueformonthtodate[0].totalRevenueformonthtodate = 0
      }
    // console.log(totalrevenueformonthtodate, "totalrevenueformonthtodate");

    // sadasd
    let paymentForGivenDate = await connection.db
      .collection("bookings")
      .aggregate(aggregateToFindPaymentForGivenDate)
      .toArray();
    // console.log(paymentForGivenDate, "paymentForGivenDate");

    let paymentForMonthToDate = await connection.db
      .collection("bookings")
      .aggregate(aggregateToFindPaymentForMonthToDate)
      .toArray();
    // console.log(paymentForMonthToDate, "paymentForMonthToDate");

    // here are all the mongodb queries for room revenue component

    let totaloccupiedrooms = await connection.db
      .collection("bookings")
      .aggregate(aggregateToFindTotaloccupiedRoomsForADay)
      .toArray();
    // console.log(totaloccupiedrooms, "totaloccupiedrooms");

    let totalNumberofRoomsOfeachTypeForgivendate = await connection.db
      .collection("rooms")
      .aggregate(aggregatetofindTotalNumberofRoomsOfeachType)
      .toArray();

    let occupancy = 
    totaloccupiedrooms.length===0 ?  0 : 
    totaloccupiedrooms[0].noOfRooms  / totalNumberofRoomsOfeachTypeForgivendate[0].totalRoomsOfeachType ;


    let adrForGivenDate = await connection.db
      .collection("bookings")
      .aggregate(aggregateToFindAdrForGivenDate)
      .toArray();
      // console.log(adrForGivenDate,"focus")
    let roomrevenue = occupancy * totalNumberofRoomsOfeachTypeForgivendate[0].totalRoomsOfeachType * ( adrForGivenDate.length ===0? 0: adrForGivenDate[0].adrgivendate)
    // RevPAR is also calculated by dividing total room revenue by the total number of rooms available in the period being measured.
    let revpargivendate = 
      adrForGivenDate.length===0?0:adrForGivenDate[0].totalPrice /
      totalNumberofRoomsOfeachTypeForgivendate[0].totalRoomsOfeachType;
    // console.log(revpargivendate, "revpargivendate");
    //here all the queries end

    let AdrMonthToDate = await connection.db
      .collection("bookings")
      .aggregate(aggregateToFindAdrMonthToDate)
      .toArray();
    // console.log(AdrMonthToDate, "AdrMonthToDate");
    if(startdate === givendate){
      AdrMonthToDate[0].adrmonthtodate=0
    }

    let monthtodatedays = new Date(givendate).getDate() - 1;

    let totalNumberofRoomsAvailablemonthtodate =
      totalNumberofRoomsOfeachTypeForgivendate[0].totalRoomsOfeachType *
      monthtodatedays;

    let TotalRoomsOccupiedForMonthToDate = await connection.db
      .collection("bookings")
      .aggregate(aggregateToFindTotalRoomsOccupiedForMonthToDate)
      .toArray();

      if(startdate === givendate)
      TotalRoomsOccupiedForMonthToDate[0].noOfRooms = 0


    let occupancyMonthToDate =
     TotalRoomsOccupiedForMonthToDate[0].noOfRooms === 0?0:
      (TotalRoomsOccupiedForMonthToDate[0].noOfRooms /
        totalNumberofRoomsAvailablemonthtodate) 
    // console.log(occupancyMonthToDate, "occupancyMonthToDate");

    let totalRoomRevenueMonthtoDate =
      occupancyMonthToDate * totalNumberofRoomsAvailablemonthtodate * AdrMonthToDate.length===0?0:AdrMonthToDate[0].adrmonthtodate;
    // console.log(totalRoomRevenueMonthtoDate, "totalRoomRevenueMonthtoDate");

    let revparForMonthToDate =
    AdrMonthToDate.length === 0 ? 0:
      AdrMonthToDate[0].totalPrice / totalNumberofRoomsAvailablemonthtodate;
    // console.log(revparForMonthToDate, "revparForMonthToDate");


    // aggregateToFindTotalRoomsAvailableformonth

       let totalRoomsOccupiedformonth = await connection.db.collection("bookings").aggregate(aggregateToFindTotalRoomsOccupiedformonth).toArray();
      // console.log(totalRoomsOccupiedformonth,"totalRoomsOccupiedformonth")

      let totalmonthdays = numberOfDays
      // console.log(totalmonthdays,"totalmonthdays@@@@@@@@@@@@@@@@")

      let totalroomsAvailableforwholemonth =      totalNumberofRoomsOfeachTypeForgivendate[0].totalRoomsOfeachType *
      totalmonthdays;

      // console.log(totalroomsAvailableforwholemonth,"totalroomsAvailableforwholemonth")

      let occupancyForWholeMonth = totalRoomsOccupiedformonth[0].noOfRooms / totalroomsAvailableforwholemonth 
      // console.log(occupancyForWholeMonth,"occupancyForWholeMonth%")

      // aggregateToFindAdrForWholeMonth

        let AdrForWholeMonth = await connection.db.collection("bookings").aggregate(aggregateToFindAdrForWholeMonth).toArray();
        // console.log(AdrForWholeMonth,"AdrForWholeMonth")

       let totalRoomRevenueWholeMonth =
      occupancyForWholeMonth * totalroomsAvailableforwholemonth* AdrForWholeMonth[0].adrWholeMonth;
    // console.log(totalRoomRevenueWholeMonth, "totalRoomRevenueWholeMonth");

      let revparForWholeMonth =
     AdrForWholeMonth[0].totalPrice / totalroomsAvailableforwholemonth;
    // console.log(revparForWholeMonth, "revparForMonthToDate");

    data = {
      roomRevenue: {
        today: {
          adrforgivendate:
            adrForGivenDate.length === 0
              ? 0
              : adrForGivenDate[0].adrgivendate.toFixed(2),
          roomrevenue: roomrevenue ? +roomrevenue.toFixed(2) : 0,
          revpargivendate: revpargivendate ? +revpargivendate.toFixed(2) : 0,
        },
        monthToDate: {
          AdrMonthToDate:
            AdrMonthToDate.length === 0
              ? 0
              : +AdrMonthToDate[0].adrmonthtodate.toFixed(2),
          totalRoomRevenueMonthtoDate: +totalRoomRevenueMonthtoDate.toFixed(2),
          revparForMonthToDate: +revparForMonthToDate.toFixed(2),
        },
      },
      statistics: {
        today: {
          totalGuests:
            totalGuests.length === 0 ? 0 : totalGuests[0].totalnoofPerson,
          totalCheckIns:
            totalCheckIns.length === 0 ? 0 : totalCheckIns[0].count,
          totalCheckOuts:
            totalCheckOuts.length === 0 ? 0 : totalCheckOuts[0].count,
          walkInforGivenDate:
            walkInforGivenDate.length === 0 ? 0 : walkInforGivenDate[0].count,
          avglostotalnightsgivendate:
            avglostotalnightsgivendate.length === 0
              ? 0
              : +avglostotalnightsgivendate[0].avglosnightsstayed.toFixed(2),
          avgLosForgivendate:
            avgLosForgivendate.length === 0
              ? 0
              : +avgLosForgivendate[0].avglosforgivendate.toFixed(2),
          adrforgivendateperguest:
            adrforgivendateperguest.length === 0
              ? 0
              : +adrforgivendateperguest[0].givendateadr.toFixed(2),
          totalrevenueforgivendate:
            totalrevenueforgivendate.length === 0
              ? 0
              : +totalrevenueforgivendate[0].totalPrice.toFixed(2),
          paymentForGivenDate:
            paymentForGivenDate.length === 0
              ? 0
              : +paymentForGivenDate[0].paymentforgivendate.toFixed(2),
        },
        monthTodate: {
          totalGuestsmonthtodate:
            totalGuestsmonthtodate.length === 0
              ? 0
              : totalGuestsmonthtodate[0].totalnoofPerson,
          totalcheckInsMonthtodate:
            totalcheckInsMonthtodate.length === 0
              ? 0
              : totalcheckInsMonthtodate[0].totalCheckIns,
          totalcheckOutsmonthtoDate:
            totalcheckOutsmonthtoDate.length === 0
              ? 0
              : +totalcheckOutsmonthtoDate[0].totalCheckOuts.toFixed(2),
          walkInforGivenDatemonthtodate:
            walkInforGivenDatemonthtodate.length === 0
              ? 0
              : walkInforGivenDatemonthtodate[0].count,
          AvgLosmonthtodate:
            AvgLosmonthtodate.length === 0
              ? 0
              : +AvgLosmonthtodate[0].avglosformonthtodate.toFixed(2),
          avglostotalnightsmonthtodate:
            avglostotalnightsmonthtodate.length === 0
              ? 0
              : +avglostotalnightsmonthtodate[0].avglosnightsstayed.toFixed(2),
          adrforemonthtodateperguest:
            adrforemonthtodateperguest.length === 0
              ? 0
              : +adrforemonthtodateperguest[0].monthtodateadr.toFixed(2),
          totalrevenueformonthtodate:
            totalrevenueformonthtodate.length === 0
              ? 0
              : +totalrevenueformonthtodate[0].totalRevenueformonthtodate.toFixed(
                  2
                ),
          paymentForMonthToDate:
            paymentForMonthToDate.length === 0
              ? 0
              : +paymentForMonthToDate[0].totalPrice.toFixed(2),
        },
      },
      booksForecast: {
        totalRoomsOccupiedformonth:
          totalRoomsOccupiedformonth.length === 0
            ? 0
            : totalRoomsOccupiedformonth[0].noOfRooms,
        occupancyForWholeMonth: +(occupancyForWholeMonth *100).toFixed(2),
        AdrForWholeMonth:
          AdrForWholeMonth.length === 0
            ? 0
            : +AdrForWholeMonth[0].adrWholeMonth.toFixed(2),
        totalRoomRevenueWholeMonth: +totalRoomRevenueWholeMonth.toFixed(2),
        revparForWholeMonth: +revparForWholeMonth.toFixed(2),
      },
      occupancy: {
        todaydata: occupancyratetodaydata,
        wholemonthdata: occupancyRateMonthData,
      },
    };

    data ? (status = true) : (status = false);
    status ? (message = "data has been recieved") : (message = "");
  } catch (error) {
    status = false;
    message = error.message;
  }

  let response = { status, data, message };
  return response;
};
