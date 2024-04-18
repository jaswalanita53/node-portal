const {
    dbConnect
} = require("../../common/dbConnect")
let status, data, message
exports.deletePlanAndPackage = async (request) => {
    const deletedData = request
    try {
        const connection = await dbConnect();
        const ObjectId = require('mongodb').ObjectID
        const query = {
            '_id': ObjectId(deletedData?.id)
        }
        let deletedPlan = await connection.db.collection("planAndPackages").deleteOne(query)
        deletedPlan ? status = true : status = false;
        status == true ? message = "Plan Deleted Successfully !" : message = "Something Went Wrong Please Try again!!";
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