const { ObjectId } = require("mongodb");
const { dbConnect } = require("../../common/dbConnect");
let status, message;

exports.editEmployee = async (request) => {
  let recievedData = request.body;
  try {
    const connection = await dbConnect();
    let result = await connection.db.collection("employees").updateOne(
      { _id: ObjectId(recievedData.id) },
      {
        $set: {
          name: recievedData.name,
          age: recievedData.age,
          gender: recievedData.gender,
          job: recievedData.job,
          datehired: recievedData.datehired,
        },
      }
    );
    // console.log(result);
    // let insertedId = result.insertedId;
    // let data1 = {
    //   monday: "+",
    //   tuesday: "+",
    //   wednesday: "+",
    //   thursday: "+",
    //   friday: "+",
    //   saturday: "+",
    //   sunday: "+",
    //   employeeName: insertedId,
    // };
    // let result2 = await connection.db.collection("schedule").insertOne(data1);
    // console.log(result2);

    result ? (status = true) : (status = false);
    status
      ? (message = "employee edited successfully")
      : (message = "There is some error");
  } catch (error) {
    status = false;
    message = error.message;
  }
  let response = { status, message };
  return response;
};
