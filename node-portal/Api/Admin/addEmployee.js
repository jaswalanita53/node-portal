const { ObjectId } = require("mongodb");
const { dbConnect } = require("../../common/dbConnect");
let status, message;

exports.addEmployee = async (request) => {
  let recievedData = request.body;

  try {
    const connection = await dbConnect();
    let result = await connection.db
      .collection("employees")
      .insertOne(recievedData.employeedata);

    let insertedId = result.insertedId;
    let data1 = {
      employeeType: insertedId,
    };
    let result2 = await connection.db.collection("schedule").insertOne(data1);
    // console.log(result2);

    result ? (status = true) : (status = false);
    status
      ? (message = "employee added successfully")
      : (message = "There is some error");
  } catch (error) {
    status = false;
    message = error.message;
  }
  let response = { status, message };
  return response;
};
