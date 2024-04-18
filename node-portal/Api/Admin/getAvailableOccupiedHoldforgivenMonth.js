const { dbConnect } = require("../../common/dbConnect");
let status, data, message;

exports.getAvailableOccupiedHoldforgivenMonth = async (content) => {
  // console.log(content.id)
  let date1 = new Date(content.id);
  date1.setDate(2);
  let date2 = new Date(content.id);
  date2.setDate(1);
  date2 = date2.toISOString().split("T")[0];
  // console.log(date2,"this is the date2");
  date1 = date1.toISOString().split("T")[0];
  // console.log(date1, "previous date");

  let givendate = new Date(content.id);
  const currentmonth = givendate.getMonth();
  givendate.setMonth(currentmonth + 1);
  givendate.setDate(1);
  givendate = givendate.toISOString().split("T")[0];
  // console.log(givendate, "nextdate");

  const givenDate2 = new Date(content.id); // Replace '2023-05-15' with your given date

  // Get the year and month from the given date
  const year = givenDate2.getFullYear();
  const month = givenDate2.getMonth();
  // Create a new date object for the first day of the next month
  const firstDayNextMonth = new Date(year, month + 1, 1);
  // Subtract one day from the first day of the next month to get the last day of the given month
  const lastDayCurrentMonth = new Date(firstDayNextMonth - 1);
  // Extract the number of days
  const numberOfDays = lastDayCurrentMonth.getDate();
  // console.log(numberOfDays, "this is the numberof dayss");

  try {
    const connection = await dbConnect();

    let aggregateToGetBookedRoomsOfaMonth = [
      {
        $match: {
          checkOutDate: {
            $gte: date1,
            $lte: givendate,
          },
        },
      },
      {
        $project: {
          checkInDate: 1,
          checkOutDate: 1,
          totalDays: 1,
          roomKeys: 1,
        },
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
    ];

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

    // console.log(bookedroomsmonthdata, "this is the data");

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
    let percentageofroomsinmaintenance =
      (totalroomsinmaintenance / totalroomsingivenmonth) * 100;
      // console.log(percentageofroomsinmaintenance,"percentageofroomsinmaintenance")
      // console.log("thsisi sasdabsdhj")
    let roomsbooked = percentageofroomsbookedinmonth
      ? percentageofroomsbookedinmonth
      : 0;
    let roominmaintenance = percentageofroomsinmaintenance
      ? percentageofroomsinmaintenance
      : 0;
    let availableRooms = 100 - roomsbooked - roominmaintenance;
    // console.log(availableRooms, "availableRoooms");
    // console.log(roomsbooked, "roomsbooked");
    // console.log(roominmaintenance, "roominmaintenance");

    data = {
      availableRooms: Number(availableRooms.toFixed(2)),
      percentageofroomsinmaintenance: Number(roominmaintenance.toFixed(2)),
      percentageofRoomsBooked: Number(roomsbooked.toFixed(2)) ,
    };
    data ? (status = true) : (status = false);
    message = "roomdata has been fetched";
  } catch (error) {
    status = false;
    message = error.message;
  }

  let response = { status, data, message };
  return response;
};
