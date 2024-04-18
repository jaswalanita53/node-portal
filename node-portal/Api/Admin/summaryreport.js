const { dbConnect } = require("../../common/dbConnect");
let status, data, message;
exports.summaryreport = async (content) => {
    // console.log(content)

    let provideddate = content.id
    let year = new Date(provideddate).getFullYear()
    let month= new Date(provideddate).getMonth()
    let firstdateofmonth = new Date(provideddate).setDate(1)
    let lastdateofmonth = new Date(year,month+1,1)
    firstdateofmonth = new Date(firstdateofmonth)

    // console.log(firstdateofmonth,"firstdateofmonth");
    // console.log(lastdateofmonth,"lastdateofmonth");


    try {
    const connection = await dbConnect();
    
    const aggregatetofindTotalNumberofRoomsOfeachType = [
      {
        $project: {
          totalNumberOfRooms: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalRoomsOfeachType: { $sum: "$totalNumberOfRooms" },
        },
      },
    ];

    let totalAvailableRoomsSingleDay = await connection?.db?.collection("rooms").aggregate(aggregatetofindTotalNumberofRoomsOfeachType).toArray();
    

    let wholemonthdata = []
    const calculatedateforaday = async(date,day) =>{
    // console.log(date,"date");
    // console.log(day,"day")
const aggregateofperdaysummaryreport = ([
  {
  $match:{
    checkInDate:{$lte:date},
    checkOutDate:{$gt:date}
  }
  },{
    $project:{
      noOfRooms:1,
      roomTotal:{$divide:[{$toDouble:"$roomTotal"},{$toDouble:"$totalDays"}]},
      totalPrice:{$divide:[{$toDouble:"$totalPrice"},{$toDouble:"$totalDays"}]},
      totalDays:1
    }
  },
   {
    $group:{
      _id:null,
      totalRooms:{$sum:"$noOfRooms"},
      roomchargesbeforetax:{$sum:"$roomTotal"},
      allCharges:{$sum:"$totalPrice"},
    }
  },{
    $project:{
      totalRooms:1,
      roomchargesbeforetax:1,
      allCharges:1,
      date:date
    }
  }
])


    let requireddata = await connection.db.collection("bookings").aggregate(aggregateofperdaysummaryreport).toArray();
    // console.log(requireddata,"this is the required data")
    // console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
    // console.log(requireddata.length===0?0:requireddata[0].totalRooms,"noOfRooms")
    // console.log(requireddata.length===0?0:requireddata[0].roomchargesbeforetax,"roomtotal")
    // console.log(requireddata.length===0?0:requireddata[0].allCharges,"totalPrice")
    // console.log(requireddata.length===0?date:requireddata[0].date,"date")
    // Bookings : total rooms booked (percentage of total rooms booked)
// RevPAR = Total Room Revenue / Number of Available Rooms
// ADR = Total Room Revenue / Number of Rooms Sold
// Room charges (before taxes )
// All Charges 
// All Payments
// Balance = All Charges - All Payments

    let dayobj= {
        "SellingDate":`${date} ${day}`,
        "Bookings":`${requireddata.length===0?0:requireddata[0].totalRooms} (${ requireddata.length===0?0: requireddata[0].totalRooms/totalAvailableRoomsSingleDay[0].totalRoomsOfeachType}%)`,
        "RevPAR":`${requireddata.length===0?0:+(requireddata[0].allCharges/totalAvailableRoomsSingleDay[0].totalRoomsOfeachType).toFixed(2)}`,
        "ADR":`${requireddata.length===0?0:+(requireddata[0].allCharges/requireddata[0].totalRooms).toFixed(2)}`,
        "RoomChargesBeforeTax":`${requireddata.length===0?0:+requireddata[0].roomchargesbeforetax.toFixed(2)}`,
        "AllCharges":`${requireddata.length===0?0:+requireddata[0].allCharges.toFixed(2)}`,
        "AllPayments":0,
        "Balance":`${requireddata.length===0?0:+requireddata[0].allCharges.toFixed(2)}`
    }
    wholemonthdata.push(dayobj);

} 

    for(let date = firstdateofmonth ; date<= lastdateofmonth; date.setDate(date.getDate()+1) ){
        let datestring = date.toISOString().split("T")[0];
        let fullday = date.toLocaleString('en-US',{ weekday: 'long'})
        await calculatedateforaday(datestring,fullday)
    }

    wholemonthdata.length===0?data="":data=wholemonthdata
    data?status=true:status=false,
    status?message="data has been recieved":"data not available"



    } catch (error) {
        // console.log(error,"error")
    status = false;
    message = error.message;
  }

  let response = { status, data, message };
  return response;
};
