const { dbConnect } = require("../../common/dbConnect");
let status, message, data ;

exports.getSchedule = async (req) => {

  try {
    const connection = await dbConnect();
    const searchDate = req.query.monday;
    // console.log(searchDate,"searchDate");
  
    const query = { 
      [searchDate]: { $exists: false } 
    };

    const options = {
      upsert: false,
    };

    const update = {
      $set: {
        [req.query.monday]: "+",
        [req.query.tuesday]: "+",
        [req.query.wednesday]: "+",
        [req.query.thursday]: "+",
        [req.query.friday]: "+",
        [req.query.saturday]: "+",
        [req.query.sunday]: "+",
      },
    };

    let result  = await connection.db.collection("schedule").updateMany(query , update ,options )

    // console.log(result,"treuslts  ")

    let aggregation = [
      {
        $lookup: {
          from: "employees",
          localField: "employeeType",
          foreignField: "_id",
          as: "employeeType",
        },
      },
      {
        $unwind: "$employeeType",
      },
      {
        $project: {
          [req.query.monday]: 1,
          [req.query.tuesday]: 1,
          [req.query.wednesday]: 1,
          [req.query.thursday]: 1,
          [req.query.friday]: 1,
          [req.query.saturday]: 1,
          [req.query.sunday]: 1,
          "employeeType":1
        },
      },
    ];

    let datatosend = await connection.db
      .collection("schedule")
      .aggregate(aggregation)
      .toArray();

    data={datatosend}
    result ? (status = true) : (status = false);
    status
      ? (message = "data fetched successfully")
      : (message = "there is some error");
  } catch (error) {
    status = false;
    message = error.message;
  }
  let response = { status, message, data };
  return response;
};
