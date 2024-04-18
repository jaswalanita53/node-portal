let status, data, responsemsg

exports.sendSMSToClient = async (request) => {
    // console.log(request,"SADASD")
    let msg = request.body
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const client = require('twilio')(accountSid, authToken);
        client.messages 
            .create({
                body: msg,
                from: '+18775894957',
                // to: '+13054587664'
                to:"+919936603493"  
            })
            .then(message => {data = message; console.log(message,"message")})
            .catch((error) => console.log(error.message,"error messgae"));
    } catch (error) {
        status = false;
        responsemsg = error.message  
    } 
    let response = { status, data, responsemsg }
    return response;
}     