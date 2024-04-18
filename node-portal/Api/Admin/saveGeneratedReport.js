const { dbConnect } = require("../../common/dbConnect");
let status, data

exports.saveBookingReports = (async (request) => {
    const reportInformation = request
    try {
        const connection = await dbConnect();
        let reportsCount = await connection?.db.collection("generatedReports").count()
        if(reportsCount == 10){
            let deleteLastRecords = await connection?.db.collection('generatedReports').deleteOne({})
             return false;
        }
        let reports = await connection?.db.collection("generatedReports").insertOne(reportInformation)

        reports ? status = true : status = false;
        status == true ? message = "Report successfully Submit!" : message = "Report not Submit!";
    } catch (error) {
        status = false
        message = error.message
    }
    let response = { status, message }
    return response
})