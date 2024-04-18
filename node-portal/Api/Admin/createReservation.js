const { dbConnect } = require("../../common/dbConnect")
const { prepareMail } = require('../../common/server')
const fs = require('fs');
const moment = require('moment')
let ejs = require('ejs');
let status, data, message


exports.createReservation = async (request) => {
  
    const ObjectId = require('mongodb').ObjectID
    let currentDate = moment(new Date()).format('YYYY-MM-DD')
    // console.log(request.scanIddata,"@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
    const additionalGuest = request?.additionalGuest
    const roomKeys = request?.roomKeys
    const randomNumber = Math.floor(Math.random() * 899999999 + 100000000)

    try {
 
        const connection = await dbConnect()
 
        const getRoomType = await connection.db.collection('rooms').findOne({ _id: ObjectId(roomKeys[0]?.id) });

        let totalNumberOfRooms = getRoomType.totalNumberOfRooms;

        const checkAvailability = await connection.db.collection('bookings').find().toArray()

            let totalNumberRoomArray = []
            let roomBookedArr = []
            checkAvailability.map((value, index) => { if (currentDate >= value.checkInDate && currentDate <= value.checkOutDate) { roomBookedArr.push(value.roomNumber) } })
            for (let i = 1; i <= totalNumberOfRooms; i++) {
                totalNumberRoomArray.push(i)
            }
            let totalAvailableRooms = totalNumberRoomArray.filter((item) => !roomBookedArr.some((item2) => item2 == item))
            const userBasicInformationObject = request?.userBasicInformation
            // console.log(userBasicInformationObject,"thisistherequiredfocuasdsads")
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
                    scannedIdData: request.scanIddata ? request.scanIddata : "",
                  },
                },
                { upsert: true }
              );
            
            // console.log(users,"useasesdasdad")

            let userId = users.lastErrorObject.updatedExisting
              ? users.value._id
              : users.lastErrorObject.upserted;
//             {
//   lastErrorObject: { n: 1, updatedExisting: true },
//   value: {
//     _id: new ObjectId("64475cb8b0ae5f76dd42238c"),
//     firstName: 'sahil',
//     lastName: 'tester',
//     emailAddress: 'usqe@gnmail.com',
//     phoneNumber: '12312312',
//     country: 'Portugal',
//     billingAddress: {
//       zipcode: 'asdsadsad',
//       address1: 'asdasd',
//       address2: 'asdasd',
//       city: 'asdasda',
//       state: 'sadasd',
//       country: 'Portugal'
//     }
//   },
//   ok: 1,
//   '$clusterTime': {
//     clusterTime: new Timestamp({ t: 1686572769, i: 11 }),
//     signature: {
//       hash: new Binary(Buffer.from("ddd867cd4d97a940b85de2573ce8101d352e2b3b", "hex"), 0),
//       keyId: new Long("7186719225359106051")
//     }
//   },
//   operationTime: new Timestamp({ t: 1686572769, i: 11 })
// } useasesdasdad


// {
//   lastErrorObject: {
//     n: 1,
//     updatedExisting: false,
//     upserted: new ObjectId("6487100deeaf34a0ecf54609")
//   },
//   value: null,
//   ok: 1,
//   '$clusterTime': {
//     clusterTime: new Timestamp({ t: 1686573069, i: 7 }),
//     signature: {
//       hash: new Binary(Buffer.from("cc392496ffffb13de0fdf109615b87adbf43ef98", "hex"), 0),
//       keyId: new Long("7186719225359106051")
//     }
//   },
//   operationTime: new Timestamp({ t: 1686573069, i: 7 })
// } useasesdasdad

// console.log(request,"this is the focus")

            // let users = await connection.db.collection('users').insertOne({ ...userBasicInformationObject })
            const bookingInformationObject = {
                'userKey': userId,
                'bookingID': randomNumber,
                'roomNumber': totalAvailableRooms[0],
                'noOfRooms': request?.noOfRooms,
                'noOfPerson': request?.noOfPerson,
                'noOfAdults': request?.noOfAdults,
                'noOfChildren': request?.noOfChildren,
                'fairPrice': request?.fairPrice,
                'discount': request?.discount,
                'roomTotal': request?.roomTotal,
                'totalTax': request?.totalTax,
                'totalFees': request?.totalFees,
                'totalPrice': request?.totalPrice,
                'bookingStatus': request?.bookingStatus,
                'paymentStatus': request?.paymentStatus,
                'bookingDate': request?.bookingDate,
                'checkInDate': request?.checkInDate,
                'checkOutDate': request?.checkOutDate,
                'totalDays': request?.totalDays,
                'isWalkIn':request?.isWalkIn?request?.isWalkIn:false,
                additionalGuest,
                roomKeys,
                
            }
 
            let bookings = await connection.db.collection("bookings").insertOne({ ...bookingInformationObject });
            // console.log(bookings,"bookings");
            let newlyCreatedData = await connection.db.collection("bookings").findOne({ _id:bookings.insertedId });
            let userdata = await connection.db.collection("users").findOne({ _id: newlyCreatedData.userKey});
            // console.log(userdata)
            bookings ? status = true : status = false
            status == true ? message = "Booking successfully!!" : message = "Booking not successfully!"

       
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
    
    catch (error) {
        status = false
        message = error.message
    }
    let response = { status, message }
    return response
}
