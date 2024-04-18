const { ObjectId } = require("mongodb");
const {
    dbConnect
} = require("../../common/dbConnect")
let status, data, message
exports.deletePlanAndPackage = async (request) => {
    // console.log(request,"asdasd")
    const deletedData = request
    if (!deletedData.id) {
        return { error: 'Bad Request', message: 'Please provide all required data', status: 400 };
    }
    try {
        const connection = await dbConnect();
        // const ObjectId = require('mongodb').ObjectID
        // const query = {
        //     '_id': ObjectId(deletedData?.id)
        // }
        let deletedPlan = await connection.db.collection("planAndPackages").deleteOne({ _id: ObjectId(deletedData.id)})
        // console.log(deletedPlan,"asdasdsad")
        deletedPlan.deletedCount > 0 ? status = true : status = false;
        status == true ? message = "Plan Deleted Successfully !" : message = "The provided id does not exist";
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