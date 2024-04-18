const { ObjectId } = require("mongodb");
const { dbConnect } = require("../../common/dbConnect");
let status, data
exports.getGuestDetails = async (request) =>{

    const userId = request.query.userId;
    if(!userId){
      return { error: 'Bad Request', message: 'Please provide all required data', status: 400 };
    }

// let aggregationToGetGuestDetails = [
//   {
//     $match: {
//       $expr: {
//         $eq: [
//           {
//             $toString: "$_id",
//           },
//           userId,
//         ],
//       },
//     },
//   },
// ];
      try {
        const connection = await dbConnect();
        const guestDetails = await connection.db
          .collection("users").findOne({ _id: ObjectId(userId) })
          // .aggregate(aggregationToGetGuestDetails)
      
     
        guestDetails ? (status = true) : (status = false);
        status ? (data = guestDetails) : (data ={
          message:"No Guest exists with provided id"
        } );
      } catch (error) {
        status = false;
        data = error.message;
      }
      let response = { status, data };
      return response;
}