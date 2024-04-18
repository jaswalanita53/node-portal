const { dbConnect } = require("../../common/dbConnect")
let status, data, message

exports.getAllRatesAndPlans = async () => {
    try {
        const connection = await dbConnect()
        let getAllRatesAndGrowth = await connection.db.collection('planAndPackages').find().toArray()
        getAllRatesAndGrowth ? status = true : status = false;
        getAllRatesAndGrowth ? data = getAllRatesAndGrowth : data = []

    } catch (error) {
        status = false
        message = error.message
    }
    let response = { status, data, message }
    return response;
}