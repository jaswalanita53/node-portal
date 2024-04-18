const { dbConnect } = require("../../common/dbConnect");
let status, data,message
exports.getPreviousStayByUserId = async (request) =>{
    const ObjectId = require("mongodb").ObjectID;
    const userKey = request?.userKey;
    // console.log(userKey, "userKey");
      // const aggregation = [
      //   {
      //     $match: {
      //       userKey: ObjectId(userKey),
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "users",
      //       localField: "userKey",
      //       foreignField: "_id",
      //       as: "userInfo",
      //     },
      //   },
      //   {
      //     $addFields: {
      //       roomKey: {
      //         $map: {
      //           input: "$roomKeys",
      //           as: "roomInfo",
      //           in: {
      //             $toObjectId: "$$roomInfo.id",
      //           },
      //         },
      //       },
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "rooms",
      //       localField: "roomKey",
      //       foreignField: "_id",
      //       as: "roomsInfo",
      //     },
      //   },
      //   {
      //     $project: {
      //       roomKey: 0,
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$userInfo",
      //     },
      //   },
      // ];

      const aggregationToFindPreviousBookings = [
        {
          $match: {
            $expr: {
              $eq: [{ $toString: "$userKey" }, userKey],
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userKey",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        {
          $project: {
            userKey: 1,
            bookingID: 1,
            roomNumber: 1,
            bookingDate: 1,
            checkInDate: 1,
            checkOutDate: 1,
            noOfPerson:1,
            totalDays: 1,
            totalPrice: 1,
            bookingStatus: 1,
            paymentStatus: 1,
            userInfo: {
              firstName: 1,
              lastName: 1,
            },
          },
        },
        {
          $unwind: "$userInfo",
        },
        {
          $sort: { bookingDate: -1 },
        },
      ];

    try {
        const connection = await dbConnect()
        const reservation = await connection.db
          .collection("bookings")
          .aggregate(aggregationToFindPreviousBookings)
          .toArray();
          // console.log(reservation, "reservation");
          if(reservation.length ===1){
            // console.log("we are here 1111111111")
            message = "No previous reservations found for the given user";
            status=false;
            data = "no data exists"
          }
          else if (reservation.length > 1){
            // here we are deleting the first element of reservation array as it is the most recent one and we want only previous bookings 
            //  console.log("we are here 2222222");
            reservation.shift();
            status = true;
            status ? data = reservation : data = null
          }
    } catch (error) {
        status = false
        data = error.message
        message="There is some error"
    }
    let response = { status, data, message }
    return response;
}
