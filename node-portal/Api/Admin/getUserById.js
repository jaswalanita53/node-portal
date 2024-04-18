const { dbConnect } = require("../../common/dbConnect")
const { ObjectId } = require('mongodb');

exports.getUserById = async (request) => {
console.log(request,"req")
    if(!request.userId){
        return { error: 'Bad Request', message: 'No id provided', status: 400 };
    }
    let status, data, message
    let response
    try {    
        const connection = await dbConnect()  
        // console.log("we never reached here")
        const reports = await connection.db.collection("users").findOne({ _id: ObjectId(request.userId) })
        // console.log("we never reached here")
        reports ? status = true : status = false
        status === true ? data = reports : 
        data = "No user exists for provided id"
        await connection.client.close()
    } catch (error) {
        status = false
        data = error.message
    }
     response = { status, data }
    return response
}