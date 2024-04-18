const { dbConnect } = require("../../common/dbConnect");
const { ObjectId } = require("bson");
let data, status
exports.getEmployeedetails = async (req) => {
  try {
    const connection = await dbConnect();

    let aggregationToGetEmployeeDetails = [
      {
        $match: {
          _id: ObjectId(req.query.data.empId),
        },
      },
      {
        $lookup: {
          from: "schedule",
          localField: "_id",
          foreignField: "employeeType",
          as: "scheduledata",
        },
      },
      {
        $unwind: "$scheduledata",
      },
    ];
    const result = await connection.db.collection("employees")
      .aggregate(aggregationToGetEmployeeDetails)
      .toArray();
      // console.log("result",result,"result")

      let data1 = result[0].scheduledata;
      delete data1._id
      delete data1.employeeType;
      // console.log("data1",data1,"data1");
      // console.log(new Date(req.query.data.date),"%%%%%%%%%%%%%%%%%%");
      
const filteredData = [];
for (const [key, value] of Object.entries(data1)) {
  if (new Date(key) < new Date(req.query.data.date)) {
    filteredData.push([key, value]);
  }
}

const sortedDates = filteredData.sort((a, b) => {
  return new Date(b[0]) - new Date(a[0]);
});

// console.log(sortedDates,"sortedDates");
result[0].scheduledata = sortedDates;
// console.log("filteredad",filteredData,"filteredad")

      data = result;
      result?status=true:status=false

    return { status, data };
  } catch (error) {
    status=false, 
    data=error.message ;
  }
     let response = { status, data };
     return response;
};
