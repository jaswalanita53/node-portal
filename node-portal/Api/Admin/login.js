const { dbConnect } = require("../../common/dbConnect")
const jwt = require('jsonwebtoken');
let status, data

exports.login = async (request) => {
    try {
        // console.log("his is run")
        const email = request.email
        const password = request.password
        const connection = await dbConnect()
        const query = { email, password }
        let user = await connection.db.collection("adminUsers").findOne(query)
     
        user ? status = true : status = false
        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY);
        
        status ? data = { user, token } : data = null;
        await connection.client.close()
    } catch (error) {
        status = false;
        data = error.message;
    }
    let response = { status, data }
    return response
}
