const { dbConnect } = require("../../common/dbConnect")
const { prepareMail } = require('../../common/server')
const fs = require('fs');
const moment = require('moment')
let ejs = require('ejs');
let status, message, result
const axios = require('axios');

exports.authBookings = async (request) => {
  const connection = await dbConnect()
  const ObjectId = require('mongodb').ObjectID
  let currentDate = moment(new Date()).format('YYYY-MM-DD')
  const additionalGuest = request?.additionalGuest
  const roomKeys = request?.roomKeys;

  let datesArray1 = [];
  try {
    console.log(new Date(request?.checkInDate))
    console.log(moment(request.checkInDate).format("YYYY-MM-DD"))
    console.log(moment(request.checkInDate).add(1, 'days').format("YYYY-MM-DD"))

    for (
      let i = moment(request?.checkInDate);
      i.isBefore(moment(request.checkOutDate));
      i = moment(i).add(1, 'days')) {
      datesArray1.push(moment(i).format("YYYY-MM-DD"))
    }
    console.log("this is the dates Array", datesArray1);
  } catch (err) { console.log("error check", err) }

  let roomsArray = []

  try {

    await Promise.all(
      datesArray1.map(async (date) => {
      roomKeys.map(async (room) => {
          let roomsDocument = await connection.db.collection("rooms").findOne({ _id: ObjectId(room.id) })
          let data = await connection.db.collection("roomsOccupancyByDates").findOne({
            roomForeignKey: roomsDocument._id, date: request?.checkInDate
          })

          console.log("data",data)
          // console.log(data)
          let totalRooms_array = [...Array(roomsDocument.totalNumberOfRooms).keys()].map(value => value + roomsDocument.firstRoomNumber);
          let occupiedRooms_array = []
          let availableRooms_array = []
          if (data) {
            occupiedRooms_array = [...data.roomData.occupiedRoomNumbersArray, ...[...Array(room.noOfRooms).keys()].map(x => x + 1 + data.roomData.occupiedRoomNumbersArray[data.roomData.occupiedRoomNumbersArray.length - 1])]
            availableRooms_array = totalRooms_array.filter(one => !occupiedRooms_array.includes(one))   
            room["bookedRoomNumbers"] = [...Array(room.noOfRooms).keys()].map(x => x + 1 + data.roomData.occupiedRoomNumbersArray[data.roomData.occupiedRoomNumbersArray.length - 1])          
          } else {
            occupiedRooms_array = [...Array(room.noOfRooms).keys()].map(x => x + roomsDocument.firstRoomNumber)
            availableRooms_array = totalRooms_array.filter(one => !occupiedRooms_array.includes(one))  
            room["bookedRoomNumbers"] = [...Array(room.noOfRooms).keys()].map(x => x + roomsDocument.firstRoomNumber)      
          }
          // console.log("roomKeys", roomKeys)
          // return;
          let roomData = {
            totalRoomNumbersArray: totalRooms_array,
            occupiedRoomNumbersArray: occupiedRooms_array,
            availableRoomsNumbersArray: availableRooms_array
          }

          // console.table("this is the data which will be stored", roomsArray, "end111")
          await connection.db.collection("roomsOccupancyByDates").updateOne({
            date: date,
            roomName: roomsDocument.roomName,
            roomForeignKey: roomsDocument._id,
            totalRooms: roomsDocument.totalNumberOfRooms,
          }, { $set: { roomData } }, { upsert: true }, (err, result) => {
            err ? console.log("error", err) : console.log("result", result)
          })

          // console.table("roomsArray1111", roomsArray)
        })
      }))

  } catch (error) { console.log("err=>", error); return { "err": error } }

  // return ;

  const randomNumber = Math.floor(Math.random() * 899999999 + 100000000);

  const month = request.securedata.cardData.month;
  const year = request.securedata.cardData.year;
  const cardCode = request.securedata.cardData.cardCode;
  const userBasicInformationObject = request?.userBasicInformation

  try {
    const amount = request?.totalPrice;
    const opaqueData = request.opaqueData;
    let stringamount = amount.toString();
    // Make a request to Authorize.Net API for payment processing
    const authorizeNetResponse = await axios.post(
      'https://apitest.authorize.net/xml/v1/request.api',
      {
        "createTransactionRequest": {
          "merchantAuthentication": {
            "name": "64TAwe24",
            "transactionKey": "83B5L6xTdT76w3m9"
          },
          "refId": "666", // Optional, remove if not needed
          "transactionRequest": {
            "transactionType": "authCaptureTransaction",
            "amount": stringamount,
            "payment": {
              opaqueData,
            },
            "billTo": {
              "firstName": userBasicInformationObject.firstName,
              "lastName": userBasicInformationObject.lastName,
              "address": userBasicInformationObject.billingAddress.address1,
              "city": userBasicInformationObject.billingAddress.city,
              "state": userBasicInformationObject.billingAddress.state,
              "zip": userBasicInformationObject.billingAddress.zipcode,
              "country": userBasicInformationObject.billingAddress.country
            },
          },
        }
      }
    );

    const dataMessage = authorizeNetResponse.data.messages.message;
    const message = dataMessage[0].text;

    const responseCode = authorizeNetResponse.data.transactionResponse.responseCode;
    responseCode.message = {
      authorizeNet: message
    }
    // console.log('Authorize.Net responseCode:----', responseCode);
    if (responseCode === '1') {

      // authorizeNetResponse.data = {
      //    'month' : month,
      //    'year' : year,
      //    'cardCode' : cardCode
      // }

      const responseArray = [
        {
          status: authorizeNetResponse.status,
          statusText: authorizeNetResponse.statusText,
          configData: authorizeNetResponse.config.data,
          data: {
            ...authorizeNetResponse.data,  // Spread the existing data properties
            month: month,
            year: year,
            cardCode: cardCode
          }
        }
      ];


      const cardResponse = [
        {
          data: {
            ...authorizeNetResponse.data,  // Spread the existing data properties
            month: month,
            year: year,
            cardCode: cardCode
          }
        }
      ]

      // console.log('responseArray------> data',responseArray)

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
        paymentStatus: "Successful",
        bookingDate: request?.bookingDate,
        checkInDate: request?.checkInDate,
        checkOutDate: request?.checkOutDate,
        totalDays: request?.totalDays,
        additionalGuest,
        roomKeys,
        token: request.token,
        authorizeTransactionID: '123',
        responseData: responseArray,
        cardDetails: cardResponse
      };
      // console.log("bookingInformationObject", bookingInformationObject)
      let bookings = await connection.db.collection("bookings").insertOne({ ...bookingInformationObject });
      // console.log(bookings,"bookings")
      let id = bookings.insertedId;
      let newlyCreatedData = await connection.db.collection("bookings").findOne({ _id: id });
      let userdata = await connection.db.collection("users").findOne({ _id: newlyCreatedData.userKey });
      bookings ? status = true : status = false
      status == true ? result = { data: newlyCreatedData, user: userdata, message: "Booking Successful!" } : result = "Booking not Successful!"

      fs.readFile(__dirname + '/../../templates/bookingCon2.html', { encoding: 'utf-8' }, function (err, html) {
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
            checkInDate: newlyCreatedData.checkInDate,
            checkOutDate: newlyCreatedData.checkOutDate,
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
    // else {  
    //     // Transaction failed   
    //     console.log('Payment failed. Please try again.'); 
    //      status= false;
    //      result = message;

    // }
    // console.log("status", status)
      // return { status: status, message: result };

  } catch (error) {
    console.log("error this is the error", error.message)
    status = false;
    result = error.message
  }
  let response = { status, result }
  return response
}