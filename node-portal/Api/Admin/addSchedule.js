const { ObjectId } = require("mongodb");
const { dbConnect } = require("../../common/dbConnect")
let status, message;


exports.addSchedule = async (request) => {
    let recievedData = request.body;
    let documents = recievedData.datatosend;
    // console.log("starting",documents,"asdasdsadh")
    // console.log(documents,"documnets")
    // console.log(recievedData.days.monday,"modsdsnday");
    try{
            const connection = await dbConnect();
            documents.map(async(value) => {
            // console.log("values recieved", value, "values recieved");
            let oid  = ObjectId(value._id)
           
            //  console.log(values, "values");
             let result = await connection.db
               .collection("schedule")
               .findOneAndUpdate(
                 { _id: oid },
                 {
                   $set: {
                     [recievedData.days.monday]:
                       value[recievedData.days.monday],
                     [recievedData.days.tuesday]:
                       value[recievedData.days.tuesday],
                     [recievedData.days.wednesday]:
                       value[recievedData.days.wednesday],
                     [recievedData.days.thursday]:
                       value[recievedData.days.thursday],
                     [recievedData.days.friday]:
                       value[recievedData.days.friday],
                     [recievedData.days.saturday]:
                       value[recievedData.days.saturday],
                     [recievedData.days.sunday]:
                       value[recievedData.days.sunday],
                   },
                 },
                 { upsert: true }
               );
            // console.log(result,"result")
            
            result?status=true:status=false
           });
    
        status?message="data inserted successfully":message="there is some error"
    } catch (error) {
        status = false
        message = error.message
    }
    let response = { status, message }
    return response;

}