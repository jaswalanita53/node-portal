const { dbConnect } = require("../../common/dbConnect")
let status, data

exports.getPropertiesDetails = async () => {
    try {
        const connection = await dbConnect()
        let propertyDetails = await connection.db.collection("propertyDetails").find().toArray()
        propertyDetails.length > 0 ? status = true : status = false
        status == true ? data = propertyDetails : data = propertyDetails
        await connection.client.close()
    } catch (error) {
        status = false
        data = error
    }
    let response = { status, data }
    return response
}
