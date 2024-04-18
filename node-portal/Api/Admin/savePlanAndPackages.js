const { ObjectId } = require("mongodb")
const { dbConnect } = require("../../common/dbConnect")
let status, data, message
exports.savePlanAndPackages = async (request) => {
    const insertData = request
    // console.log(request,"this is the request")
    try {
        const connection = await dbConnect();
        let reports;
        let o_id
        if (insertData[1]) {
            o_id= new ObjectId(insertData[1])
            reports = await connection.db.collection("planAndPackages").updateOne(
                { "_id": o_id },
                {
                    $set:
                    {
                        planName: String(insertData[0].planName),
                        startdate: String(insertData[0].startdate),
                        enddate: String(insertData[0].enddate),
                        minLos: String(insertData[0].minLos),
                        cutOFf: String(insertData[0].cutOFf),
                        lastMinuteBooking: String(insertData[0].lastMinuteBooking),
                        selectedNumberOfWeeks: insertData[0].selectedNumberOfWeeks,
                        discountType: insertData[0].discountType,
                        discountValue: insertData[0].discountValue
                    }
                }
            )
        }
        else {
            reports = await connection.db.collection("planAndPackages").insertOne(insertData[0])
        }
        // console.log(reports,"reports")
        reports ? status = true : status = false;
        status == true ? message = "Plan Created Successfully !" : message = "Something Went Wrong Please Try again!!";
    } catch (error) {
        status = false
        message = error.message
    }
    let response = {
        status,
        data,
        message
    }
    return response
}