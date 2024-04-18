const { dbConnect } = require("../../common/dbConnect");
let status, message;

exports.getAllGuestsNotAllowed = async (request) => {

  try {
    const connection = await dbConnect();
    let result = await connection.db
      .collection("guestNotAllowed")
      .find()
      .toArray();
    // console.log(result);

    result ? (status = true) : (status = false);
    status
      ? (message = "All guests")
      : (message = "There is some error");
  } catch (error) {
    status = false;
    message = error.message;
  }
  let response = { status, message };
  return response;
};
