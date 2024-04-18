const { dbConnect } = require('../../common/dbConnect');
let status, data

exports.getReportsById = async (request) => {
    const ObjectId = require('mongodb').ObjectID
    const reportId = request?.reportId
    try {
        const connection = await dbConnect()
        const query = { _id : ObjectId(reportId)}
        let reports = await connection.db.collection("generatedReports").find(query).toArray()
        // console.log(reports)
        reports ? status = true : status = false
        status ? data = reports[0] : data = reports[0]
        await connection.client.close()
    } catch (error) {
        status = false
        data = error
    }
    let response = { status, data }
    return response

}