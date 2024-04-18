const { dbConnect } = require("../../common/dbConnect")
let status, data, message
const moment = require('moment')

exports.checkRevenueGrowth14DayMonthly = async (request) => {
    try {
        const connection = await dbConnect()
        const moment = require("moment")
        // get 14 days revenue growth per month wise mongodb
        const dayArray = [
            { day: '01' },
            { day: '02' },
            { day: '03' },
            { day: '04' },
            { day: '05' },
            { day: '06' },
            { day: '07' },
            { day: '08' },
            { day: '09' },
            { day: '10' },
            { day: '11' },
            { day: '12' },
            { day: '13' },
            { day: '14' },
        ]


        const findNumberofrooms = async(currentDate) =>{
              const aggrToFindNumOfRoomsForADay =
        [
            {    
                $match: {
                    checkInDate: { $lte: currentDate },
                    checkOutDate: { $gt: currentDate }
                }
            },
            {
                $project: {
                    "noOfRooms": 1
                }
            }, {
                $group: {
                    _id: null,
                    "roomsBooked": {
                        $sum: "$noOfRooms"
                    }
                }
            }
        ]


            let totalOccupancy = await connection.db.collection("bookings").aggregate(aggrToFindNumOfRoomsForADay).toArray()
            let result =  totalOccupancy[0]?.roomsBooked ? totalOccupancy[0]?.roomsBooked : 0

           
            // console.log(totalOccupancy,"totalOccupancy");
            // console.log(result,"result");
            return result;
        }
       

        const findADR = async (currentDate) =>{
            const aggregateToFindAdrForGivenDate = [
                {
                  $match: {
                    checkInDate: { $lte: currentDate },
                    checkOutDate: { $gt: currentDate },
                  },
                },
                {
                  $project: {
                    noOfRooms: 1,
                    totalPrice: 1,
                    totalDays: 1,
                  },
                },
                {
                  $project: {
                    noOfRooms: 1,
                    totalPrice: {
                      $divide: [{ $toDouble: "$totalPrice" }, "$totalDays"],
                    },
                  },
                },
                {
                  $group: {
                    _id: null,
                    noOfRooms: { $sum: "$noOfRooms" },
                    totalPrice: { $sum: "$totalPrice" },
                  },
                },
                {
                  $project: {
                    adrgivendate: { $divide: ["$totalPrice", "$noOfRooms"] },
                    totalPrice:1
                  },
                },
            ];

            let adrForGivenDate = await connection.db
            .collection("bookings")
            .aggregate(aggregateToFindAdrForGivenDate)
            .toArray();

         
            let result = adrForGivenDate.length === 0
              ? 0
              : adrForGivenDate[0].adrgivendate.toFixed(2)

              return result;
        }

       
        // get current month using moment
        const currentMonth = moment().format("MM");
        let getRevenueGrowth = await connection.db.collection('bookings').find().toArray()
        // let totalOccupancy = await connection.db.collection("bookings").aggregate(aggregation3).toArray()
        
        
        let room;
        let date1 = moment().startOf('month').format('YYYY-MM-DD');
        let roomsonrentdata = []
        let adrdata = []
        for(let i=0;i<14;i++){
            let numberofrooms = await findNumberofrooms(date1);
            let adr = await findADR(date1)
            roomsonrentdata.push(numberofrooms)
            adrdata.push(adr)
            date1 = moment(date1).add(1,"days").format('YYYY-MM-DD');
        }

        // console.log(adrdata,"roomsonrentdata");
        dayArray.map(async(dayArr) => {
            const dbd = getRevenueGrowth.filter((db) => currentMonth == getDateMoth(db.checkInDate, 1) && dayArr.day == getDateMoth(db.checkInDate, 2))
            const count = dbd.reduce((x, y) => x + parseInt(y.totalPrice), 0)
            dayArr.totalPrice = count.toFixed(1)
        })
        dayArray.length > 0 ? data = { dayArray, roomsonrentdata, adrdata } : data = []

    } catch (error) {
        status = false
        message = error.message
    }
    let response = { status, data, message }
    return response
}

function getDateMoth(str, index) {
    return str.split('-')[index];
}