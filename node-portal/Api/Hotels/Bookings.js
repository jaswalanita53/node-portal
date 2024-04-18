const { dbConnect } = require("../../common/dbConnect")
const { prepareMail } = require('../../common/server')
const fs = require('fs');
const moment = require('moment')
let ejs = require('ejs');
let status, message

exports.addBookings = async (request) => {
  console.log("request.cardDetails ",request.cardDetails)
    const ObjectId = require('mongodb').ObjectID
    let currentDate = moment(new Date()).format('YYYY-MM-DD')
    const additionalGuest = request?.additionalGuest
    const roomKeys = request?.roomKeys
    const randomNumber = Math.floor(Math.random() * 899999999 + 100000000)
    try {
      console.log(request.token,"request.token")
      const stripe = require('stripe')('sk_test_51NJflIG5EidfS7HUwNoPd0AcXxiBJOoxnSTBpwDnuJMoeTUKgOsEbqAzSBgnt6usncsadymDH0IVRZhFFKxWqgxg00Z1Sgpphx');
      // const stripe = Stripe("sk_test_51O0KtMSBP7VNAXBEcbYavgaSBAlJop4Xy528MPNNPrXwM0gOtbkCr9H8CEf7LgS2Xnk8zov0VvpO9wQ4LDmIBp1100NII5qc09");//Rahul test key secret
      const createPaymentIntent = async()=>{
        try{                                          
          const paymentIntent = await stripe.paymentIntents.create({
            amount: request?.totalPrice * 100,
            currency: 'usd',
            automatic_payment_methods: {enabled: true},
          });

          console.log("paymentIntent",paymentIntent)
          return paymentIntent
        }catch(err){
          console.log("this is the error of create Charge=>>>>>>>>",err.message)
        }
      }
        const connection = await dbConnect()  
        const getRoomType = await connection.db.collection('rooms').findOne({ _id: ObjectId(roomKeys[0]?.id) });
        let totalNumberOfRooms = getRoomType.totalNumberOfRooms;

        const paymentIntent = await createPaymentIntent()
        if(paymentIntent)
        {
          console.log("paymentIntent",paymentIntent)
        }

        if(paymentIntent){
        const checkAvailability = await connection.db.collection('bookings').find().toArray()
            let totalNumberRoomArray = []
            let roomBookedArr = []
            checkAvailability.map((value, index) => { if (currentDate >= value.checkInDate && currentDate <= value.checkOutDate) { roomBookedArr.push(value.roomNumber) } })
            for (let i = 1; i <= totalNumberOfRooms; i++) {
                totalNumberRoomArray.push(i)
            }
            let totalAvailableRooms = totalNumberRoomArray.filter((item) => !roomBookedArr.some((item2) => item2 == item))
            const userBasicInformationObject = request?.userBasicInformation

              let users = await connection.db
                .collection("users")
                .findOneAndUpdate(
                  {
                    emailAddress: userBasicInformationObject.emailAddress,
                  },
                  {
                    $set: {
                      firstName: userBasicInformationObject.firstName,
                      lastName: userBasicInformationObject.lastName,
                      phoneNumber: userBasicInformationObject.phoneNumber,
                      country: userBasicInformationObject.country,
                      emailAddress: userBasicInformationObject.emailAddress,
                      billingAddress: {
                        zipcode:
                          userBasicInformationObject.billingAddress.zipcode,
                        address1: 
                          userBasicInformationObject.billingAddress.address1,
                        address2:
                          userBasicInformationObject.billingAddress.address2,
                        city: userBasicInformationObject.billingAddress.city,
                        state: userBasicInformationObject.billingAddress.state,
                        country:
                          userBasicInformationObject.billingAddress.country,
                        email: userBasicInformationObject.billingAddress.email,
                      },
                      scannedIdData: request.scanIddata
                        ? request.scanIddata
                        : "",
                    },
                  },
                  { upsert: true }
                );

                 let userId = users.lastErrorObject.updatedExisting
                   ? users.value._id
                   : users.lastErrorObject.upserted;

            const bookingInformationObject = {
              userKey: userId,
              bookingID: randomNumber,
              roomNumber: totalAvailableRooms[0],
              noOfRooms: request?.noOfRooms,
              noOfPerson: request?.noOfPerson,
              noOfAdults: request?.noOfAdults,
              noOfChildren: request?.noOfChildren,
              fairPrice: request?.fairPrice,
              discount: request?.discount,
              roomTotal: request?.roomTotal,
              totalTax: request?.totalTax,
              totalFees: request?.totalFees,
              totalPrice: request?.totalPrice,
              bookingStatus: request?.bookingStatus,
              paymentStatus: paymentIntent==="succeeded"?'Succeeded':request?.paymentStatus,
              bookingDate: request?.bookingDate,
              checkInDate: request?.checkInDate,
              checkOutDate: request?.checkOutDate,
              totalDays: request?.totalDays,
              additionalGuest,
              roomKeys,
              token: request.token,
              stripeTransactionID: paymentIntent.id,
              paymentIntent: paymentIntent,
              cardDetails: request.cardDetails.data.carddata.card
            };
            console.log("bookingInformationObject", bookingInformationObject)
            let bookings = await connection.db.collection("bookings").insertOne({ ...bookingInformationObject });
            console.log(bookings,"bookings")
            let id= bookings.insertedId;
            let newlyCreatedData = await connection.db.collection("bookings").findOne({ _id:id });
            let userdata = await connection.db.collection("users").findOne({ _id: newlyCreatedData.userKey});
            bookings ? status = true : status = false
            status == true ? result = {data:newlyCreatedData, user:userdata , message:"Booking Successful!"} : result = "Booking not Successful!"

            fs.readFile(__dirname+'/../../templates/bookingCon2.html', { encoding: 'utf-8' }, function (err, html) {
                if (err) {
                    console.log("this is my fault error", err);
                } else {
                     const renderedHtml = ejs.render(html, {
                        bookingid: newlyCreatedData.bookingID,
                        noofperson: newlyCreatedData.noOfPerson,
                        firstname: userdata.firstName,
                        lastname: userdata.lastName,
                        email: userdata.emailAddress,
                        phoneNumber: userdata.phoneNumber,
                        totalPrice: newlyCreatedData.totalPrice,
                        checkInDate:newlyCreatedData.checkInDate,
                        checkOutDate:newlyCreatedData.checkOutDate,
                        paymentStatus: newlyCreatedData.paymentStatus
                     });
                    let emailPrepare = {
                        toMail: `<${request?.userBasicInformation?.emailAddress}>`,
                        subject: `booking successfully !!`,
                        html: renderedHtml
                    }
                    prepareMail(emailPrepare)
              }
            });

      }
    }
    catch (error) {
      console.log("error this is the error", error.message)
        status = false;
        result = error.message 
    }
    let response = { status, result }
    return response
}