const { ObjectId } = require("mongodb");
const { dbConnect } = require("../../common/dbConnect");
let status, message;

exports.addGuestNotAllowed = async (request) => {

  try {
    const connection = await dbConnect();

    let bool = request.body.dnr 
    let result =  await connection.db.collection("users").updateOne({_id:ObjectId(request.body.id)},{$set:{isAddedToDnr:bool}})

    result ? (status = true) : (status = false);
    status
      ? (message = "Guest added successfully to not allowed list")
      : (message = "There is some error");
  } catch (error) {
    status = false;
    message = error.message;
  }
  let response = { status, message };
  return response;
};
