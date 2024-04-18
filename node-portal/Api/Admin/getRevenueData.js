const { dbConnect } = require("../../common/dbConnect");
let status, data
exports.getRevenueData = (async (request) => {
    const moment = require('moment');
    const connection = await dbConnect();

    try {
        let currentDate = moment(new Date()).format('YYYY-MM-DD');
        let dayName = moment().format('ddd')
        // console.log(moment().subtract(-1, 'days').format('ddd')) 
        
        // console.log(moment().subtract(-1, 'days').format('MM-DD-YYYY'))
        let dayAndDatenames = {}
        switch(dayName){
            case 'Mon':
                for(let i=0;i>=-6;i--){
                    dayAndDatenames[moment().subtract(i, 'days').format('ddd')] = moment().subtract(i, 'days').format('YYYY-MM-DD') 
                }
            break;
            case 'Tue':
                for(let i=1;i>=-5;i--){
                    dayAndDatenames[moment().subtract(i, 'days').format('ddd')] = moment().subtract(i, 'days').format('YYYY-MM-DD') 
                }
            break;
            case 'Wed':
                for(let i=2;i>=-4;i--){
                    dayAndDatenames[moment().subtract(i, 'days').format('ddd') ] =  moment().subtract(i, 'days').format('YYYY-MM-DD') 
                }
            break;
            case 'Thu':
                for(let i=3;i>=-3;i--){
                    dayAndDatenames[moment().subtract(i, 'days').format('ddd')] = moment().subtract(i, 'days').format('YYYY-MM-DD') 
                }
            break;
            case 'Fri':
                for(let i=4;i>=-2;i--){
                    dayAndDatenames[moment().subtract(i, 'days').format('ddd')] = moment().subtract(i, 'days').format('YYYY-MM-DD') 
                }
            break;
            case 'Sat':
                for(let i=5;i>=-1;i--){
                    dayAndDatenames[moment().subtract(i, 'days').format('ddd')] = moment().subtract(i, 'days').format('YYYY-MM-DD') 
                }
            break;
            case 'Sun':
                for(let i=6;i>=0;i--){
                    dayAndDatenames[moment().subtract(i, 'days').format('ddd')] = moment().subtract(i, 'days').format('YYYY-MM-DD') 
                }
            break;
        }

        const foreCast  = async (value, item) =>{

         const forCastAgg = ([{
            $facet:{

         
             ADR_Net_room_Today: ([
                {
                    $match: {
                        checkInDate: { $lte: value },
                        checkOutDate: { $gt: value },
                    },
                },
                {
                    $project: {
                        noOfRooms: 1,
                        roomTotal: 1,
                        totalDays: 1,
                    },
                },
                {
                    $project: {
                        noOfRooms: 1,
                        roomTotal: {
                            $divide: [{ $toDouble: "$roomTotal" }, "$totalDays"],
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        noOfRooms: { $sum: "$noOfRooms" },
                        roomTotal: { $sum: "$roomTotal" },
                    },
                },
                {
                    $project: {
                        adr: { $divide: ["$roomTotal", "$noOfRooms"] },
                        roomTotal: 1
                    },
                },
            ]),

             aggToFindCheckOutsFOrGivenDate  :[{
                $match:{
                checkOutDate: value
                }},{$project:{
                checkOutDate:1}},
                {
                    $group:{
                    _id:null,
                    count:{$sum:1}
                    }
                    }
            ],
            
                aggToFindCheckInsForGivenDate :([{
                    $match:{
                    checkInDate:value
                    }},
                    {
                        $project:{
                            checkOutDate:1}},
                        {
                            $group:{
                            _id:null,
                            count:{$sum:1}
                            }
                            
                    }]),

                   RoomsSoldToday: [{
                        $match: {
                            $and: [
                                { checkInDate: { $lte: value } },
                                { checkOutDate: { $gt: value } }
                            ]
                        }
                    }, {
                        $project: {
                            checkInDate: 1,
                            checkOutDate: 1,
                            noOfRooms: 1
                        }
                    }, {
                        $group: {
                            _id: null,
                            noOfRooms: { $sum: "$noOfRooms" }
                        }
                    }
                    ],

                    aggregationToGetRoomRevenueforToday : [{
                        $match: {
                            checkInDate: { $lte: value },
                            checkOutDate: { $gt: value }
                        }
                    }, {
                        $project: {
                            roomTotal: 1,
                            totalPrice: 1,
                            totalDays: 1,
                            totalTax: 1,
                            onedaynetroomrevenue: { $divide: ["$roomTotal", "$totalDays"] },
                            onedaygrossroomrevenue: { $divide: ["$totalPrice", "$totalDays"] },
                            onedayTotalTax: { $divide: ["$totalTax", "$totalDays"] }
                        }
                    }, {
                        $group: {
                            _id: null,
                            onedayNetRoomRevenue: { $sum: "$onedaynetroomrevenue" },
                            onedayGrossRroomRevenue: { $sum: "$onedaygrossroomrevenue" },
                            onedayTotalTax: { $sum: "$onedayTotalTax" }
                        }
                    }
                    ]
                }
            }]) 

            const  aggToGetTotalRoomsOfEveryType = [{
                $project: {
                    totalNumberOfRooms: 1,
                    roomName: 1
                }
            }, {
                $group: {
                    _id: null,
                    totalRoomsEveryType: { $sum: "$totalNumberOfRooms" }
                }
            }]

        


                    let result = await connection.db.collection("bookings").aggregate(forCastAgg).toArray();
                    let totalRooms = await connection.db.collection("rooms").aggregate(aggToGetTotalRoomsOfEveryType).toArray();
                    // console.log(totalRooms[0]["totalRoomsEveryType"],"aggToGetTotalRoomsOfEveryType",value)
                    // console.log(result[0]?.["aggregationToGetRoomRevenueforToday"][0]?.["onedayNetRoomRevenue"],"this is the focus")
                     
                    let  data = {
                        Date:item + " " + moment(value).format('MM-DD-YYYY'),
                        ADR:result[0]["ADR_Net_room_Today"][0]["adr"]?result[0]["ADR_Net_room_Today"][0]["adr"]:0,
                        Arrivals: result[0]?.["aggToFindCheckInsForGivenDate"]?.[0]?.["count"] ?result[0]["aggToFindCheckInsForGivenDate"][0]["count"]:0,
                        Departures : result[0]?.["aggToFindCheckOutsFOrGivenDate"]?.[0]?.["count"] ? result[0]["aggToFindCheckOutsFOrGivenDate"][0]["count"] : 0,
                        "Rooms Sold": result[0]["RoomsSoldToday"][0]["noOfRooms"] ? result[0]["RoomsSoldToday"][0]["noOfRooms"]  : 0 ,
                        Occupancy: (result[0]["RoomsSoldToday"]?.[0]?.["noOfRooms"] ? result[0]?.["RoomsSoldToday"]?.[0]?.["noOfRooms"]  : 0 )* 100 / totalRooms[0]["totalRoomsEveryType"] ,
                        RevPar : ( result[0]?.["aggregationToGetRoomRevenueforToday"][0]?.["onedayNetRoomRevenue"] ? 
                        result[0]?.["aggregationToGetRoomRevenueforToday"][0]?.["onedayNetRoomRevenue"] : 0 ) /totalRooms[0]["totalRoomsEveryType"],
                        AWR: 0,
                        RevPAW: 0,
                  
                    }

                    return data

        }
    
        let forcast = {}
        Object.keys(dayAndDatenames).map(async item=>{
            // console.log(item,"item")
            // foreCast(dayAndDatenames[item])
        forcast[item]= await foreCast(dayAndDatenames[item],item)
            // console.log(forcast,"____-")
        })

        // console.log(forcast,"&&&&7")

        const firstDayofMonth = moment().startOf('month').format('YYYY-MM-DD');
        const firstDayofYear = moment().startOf('year').format('YYYY-MM-DD');
        const periodtodays_numberOfDays = moment().date();
        let tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
        const totalDaysFromFirstDayOfYearToToday = moment(currentDate.split("-")).diff(moment(firstDayofYear.split("-")), "days") + 1
        let today = moment();
        const lastYearToday = today.subtract(1, 'year').format('YYYY-MM-DD');
        const lastYearTommorow = moment(lastYearToday).add(1, 'days').format('YYYY-MM-DD');
        const lastYearTodayFirstdayofmonth = today.startOf('month').format('YYYY-MM-DD');
        const lastYearfirstday = today.startOf('year').format('YYYY-MM-DD');

        const aggregationToGetRoomRevenueforToday = [{
            $match: {
                checkInDate: { $lte: currentDate },
                checkOutDate: { $gt: currentDate }
            }
        }, {
            $project: {
                roomTotal: 1,
                totalPrice: 1,
                totalDays: 1,
                totalTax: 1,
                onedaynetroomrevenue: { $divide: ["$roomTotal", "$totalDays"] },
                onedaygrossroomrevenue: { $divide: ["$totalPrice", "$totalDays"] },
                onedayTotalTax: { $divide: ["$totalTax", "$totalDays"] }
            }
        }, {
            $group: {
                _id: null,
                onedayNetRoomRevenue: { $sum: "$onedaynetroomrevenue" },
                onedayGrossRroomRevenue: { $sum: "$onedaygrossroomrevenue" },
                onedayTotalTax: { $sum: "$onedayTotalTax" }
            }
        }
        ]

        const aggregationToGetRoomRevenueforPeriodToDate = [{
            $match: {
                checkInDate: { $lt: currentDate },
                checkOutDate: { $gte: firstDayofMonth }
            }
        }, {
            $project: {
                roomTotal: 1,
                totalPrice: 1,
                totalDays: 1,
                totalTax: 1,

                onedaynetroomrevenue: {
                    $cond: {
                        if: { $gte: ["$totalDays", periodtodays_numberOfDays] },
                        then: { $divide: ["$roomTotal", "$totalDays"] },
                        else: "$roomTotal"
                    }
                },
                onedaygrossroomrevenue: {

                    $cond: {
                        if: { $gte: ["$totalDays", periodtodays_numberOfDays] },
                        then: { $divide: ["$totalPrice", "$totalDays"] },
                        else: "$totalPrice"
                    }
                },

                onedayTotalTax: {

                    $cond: {
                        if: { $gte: ["$totalDays", periodtodays_numberOfDays] },
                        then: { $divide: ["$totalTax", "$totalDays"] },
                        else: "$totalTax"
                    }
                },

            }
        },
        {
            $project: {
                ptdDayNetRoomRevenue: {

                    $cond: {
                        if: { $gte: ["$totalDays", periodtodays_numberOfDays] },
                        then: { $multiply: ["$onedaynetroomrevenue", periodtodays_numberOfDays] },
                        else: "$onedaynetroomrevenue"
                    }
                },
                ptdDayGrossRoomRevenue: {

                    $cond: {
                        if: { $gte: ["$totalDays", periodtodays_numberOfDays] },
                        then: { $multiply: ["$onedaygrossroomrevenue", periodtodays_numberOfDays] },
                        else: "$onedaygrossroomrevenue"
                    }
                },
                ptdTotalTax: {

                    $cond: {
                        if: { $gte: ["$totalDays", periodtodays_numberOfDays] },
                        then: { $multiply: ["$onedayTotalTax", periodtodays_numberOfDays] },
                        else: "$onedayTotalTax"
                    }
                }
            }
        },
        {
            $group: {
                _id: null,
                ptdDayNetRoomRevenue: { $sum: "$ptdDayNetRoomRevenue" },
                ptdDayGrossRoomRevenue: { $sum: "$ptdDayGrossRoomRevenue" },
                ptdTotalTax: { $sum: "$ptdTotalTax" }
            }
        },
        ]

        const aggregationToGetRoomRevenueforYearToDate = [{
            $match: {
                checkInDate: { $lte: currentDate },
                checkOutDate: { $gt: firstDayofYear }
            }
        }, {
            $project: {
                roomTotal: {
                    $cond: {
                        if: { $eq: [{ $type: "$roomTotal" }, "string"] },
                        then: { $toDouble: "$roomTotal" },
                        else: "$roomTotal"
                    }
                },
                totalPrice: {

                    $cond: {
                        if: { $eq: [{ $type: "$totalPrice" }, "string"] },
                        then: { $toDouble: "$totalPrice" },
                        else: "$totalPrice"
                    }
                },

                totalDays: {

                    $cond: {
                        if: { $eq: [{ $type: "$totalDays" }, "string"] },
                        then: { $toDouble: "$totalDays" },
                        else: "$totalDays"
                    }
                },
                totalTax: {

                    $cond: {
                        if: { $eq: [{ $type: "$totalTax" }, "string"] },
                        then: { $toDouble: "$totalTax" },
                        else: "$totalTax"
                    }
                },
            }
        }, {
            $group: {
                _id: null,
                roomTotal: { $sum: "$roomTotal" },
                totalPrice: { $sum: "$totalPrice" },
                totalDays: { $sum: "$totalDays" },
                totalTax: { $sum: "$totalTax" }
            }
        }]

        const aggregationToGetRoomRevenueforLastYearToday = [{
            $match: {
                checkInDate: { $lte: lastYearToday },
                checkOutDate: { $gt: lastYearToday }
            }
        }, {
            $project: {
                roomTotal: 1,
                totalPrice: 1,
                totalDays: 1,
                totalTax: 1,
                onedaynetroomrevenue: { $divide: ["$roomTotal", "$totalDays"] },
                onedaygrossroomrevenue: { $divide: ["$totalPrice", "$totalDays"] },
                onedayTotalTax: { $divide: ["$totalTax", "$totalDays"] }
            }
        }, {
            $group: {
                _id: null,
                onedayNetRoomRevenue: { $sum: "$onedaynetroomrevenue" },
                onedayGrossRroomRevenue: { $sum: "$onedaygrossroomrevenue" },
                onedayTotalTax: { $sum: "$onedayTotalTax" }
            }
        }
        ]

        const aggregationToGetRoomRevenueforLastYearPeriodToDate = [{
            $match: {
                checkInDate: { $lt: lastYearToday },
                checkOutDate: { $gte: lastYearTodayFirstdayofmonth }
            }
        }, {
            $project: {
                roomTotal: 1,
                totalPrice: 1,
                totalDays: 1,
                totalTax: 1,

                onedaynetroomrevenue: {
                    $cond: {
                        if: { $gte: ["$totalDays", periodtodays_numberOfDays] },
                        then: { $divide: ["$roomTotal", "$totalDays"] },
                        else: "$roomTotal"
                    }
                },
                onedaygrossroomrevenue: {

                    $cond: {
                        if: { $gte: ["$totalDays", periodtodays_numberOfDays] },
                        then: { $divide: ["$totalPrice", "$totalDays"] },
                        else: "$totalPrice"
                    }
                },

                onedayTotalTax: {

                    $cond: {
                        if: { $gte: ["$totalDays", periodtodays_numberOfDays] },
                        then: { $divide: ["$totalTax", "$totalDays"] },
                        else: "$totalTax"
                    }
                },

            }
        },
        {
            $project: {
                ptdDayNetRoomRevenue: {

                    $cond: {
                        if: { $gte: ["$totalDays", periodtodays_numberOfDays] },
                        then: { $multiply: ["$onedaynetroomrevenue", periodtodays_numberOfDays] },
                        else: "$onedaynetroomrevenue"
                    }
                },
                ptdDayGrossRoomRevenue: {

                    $cond: {
                        if: { $gte: ["$totalDays", periodtodays_numberOfDays] },
                        then: { $multiply: ["$onedaygrossroomrevenue", periodtodays_numberOfDays] },
                        else: "$onedaygrossroomrevenue"
                    }
                },
                ptdTotalTax: {

                    $cond: {
                        if: { $gte: ["$totalDays", periodtodays_numberOfDays] },
                        then: { $multiply: ["$onedayTotalTax", periodtodays_numberOfDays] },
                        else: "$onedayTotalTax"
                    }
                }
            }
        },
        {
            $group: {
                _id: null,
                ptdDayNetRoomRevenue: { $sum: "$ptdDayNetRoomRevenue" },
                ptdDayGrossRoomRevenue: { $sum: "$ptdDayGrossRoomRevenue" },
                ptdTotalTax: { $sum: "$ptdTotalTax" }
            }
        },
        ]

        const aggregationToGetRoomRevenueforLastYTD = [{
            $match: {
                checkInDate: { $lte: lastYearToday },
                checkOutDate: { $gt: lastYearfirstday }
            }
        }, {
            $project: {
                roomTotal: {
                    $cond: {
                        if: { $eq: [{ $type: "$roomTotal" }, "string"] },
                        then: { $toDouble: "$roomTotal" },
                        else: "$roomTotal"
                    }
                },
                totalPrice: {

                    $cond: {
                        if: { $eq: [{ $type: "$totalPrice" }, "string"] },
                        then: { $toDouble: "$totalPrice" },
                        else: "$totalPrice"
                    }
                },

                totalDays: {

                    $cond: {
                        if: { $eq: [{ $type: "$totalDays" }, "string"] },
                        then: { $toDouble: "$totalDays" },
                        else: "$totalDays"
                    }
                },
                totalTax: {

                    $cond: {
                        if: { $eq: [{ $type: "$totalTax" }, "string"] },
                        then: { $toDouble: "$totalTax" },
                        else: "$totalTax"
                    }
                },
            }
        }, {
            $group: {
                _id: null,
                roomTotal: { $sum: "$roomTotal" },
                totalPrice: { $sum: "$totalPrice" },
                totalDays: { $sum: "$totalDays" },
                totalTax: { $sum: "$totalTax" }
            }
        }]

        const aggToGetTotalRoomsOfEveryType = [{
            $project: {
                totalNumberOfRooms: 1,
                roomName: 1
            }
        }, {
            $group: {
                _id: null,
                totalRoomsEveryType: { $sum: "$totalNumberOfRooms" }
            }
        }]

        const aggTogetOccupiedRoomsToday = [{
            $match: {
                checkInDate: { $lte: currentDate },
                checkOutDate: { $gt: currentDate }
            }
        }, {
            $project: {
                noOfRooms: 1
            }
        }, {
            $group: {
                _id: null,
                noOfRooms: { $sum: "$noOfRooms" }
            }
        }
        ]

        const aggTogetOccupiedRoomsLastYearToday = [{
            $match: {
                checkInDate: { $lte: lastYearToday },
                checkOutDate: { $gt: lastYearToday }
            }
        }, {
            $project: {
                noOfRooms: 1
            }
        }, {
            $group: {
                _id: null,
                noOfRooms: { $sum: "$noOfRooms" }
            }
        }
        ]



        const aggregationToGetTotalNumberofGroupRoomsToday = [{
            $match: {
                checkInDate: { $lte: currentDate },
                checkOutDate: { $gt: currentDate },
                noOfRooms: { $gt: 1 }
            }
        }, {
            $group: {
                _id: null,
                groupRooms: { $sum: 1 }
            }
        }
        ]

        const aggToGetRoomsInMaintenenaceToday = [{
            $match: {
                createdAt: currentDate
            }
        }, {
            $group: {
                _id: null,
                rooms: { $sum: 1 }
            }
        }
        ]

        const aggrToGetDayUseRoomsToday = [{
            $match: {
                checkInDate: currentDate,
                checkOutDate: currentDate
            }
        }
            , {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
        ]

        const aggrToGetDayUseRoomsLastYearToday = [{
            $match: {
                checkInDate: lastYearToday,
                checkOutDate: lastYearToday
            }
        }
            , {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
        ]

        const aggToGetTotalOccupiedRoomsPeriodToDate = [{
            $match: {
                checkInDate: { $lt: tomorrow },
                checkOutDate: { $gt: firstDayofMonth }
            }
        },
        {
            $project: {
                checkInDate: 1,
                checkOutDate: 1,
                noOfRooms: 1,
                totalDays: 1
            }
        }, {
            $project: {
                checkInDate: 1,
                checkOutDate: 1,
                totalDays: 1,
                noOfRooms: 1,
                occupiedRooms: {
                    $cond: {
                        if: {
                            $and: [
                                { $lt: ["$checkInDate", firstDayofMonth] },
                                { $gt: ["$checkOutDate", currentDate] }
                            ]
                        },
                        then: { $multiply: ["$noOfRooms", periodtodays_numberOfDays] },
                        else: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$checkInDate", firstDayofMonth] },
                                        { $lte: ["$checkOutDate", tomorrow] }
                                    ]
                                },
                                then: { $multiply: ["$noOfRooms", "$totalDays"] },
                                else: {
                                    $cond: {
                                        if: {
                                            $gt: ["$checkOutDate", tomorrow]
                                        },
                                        then: {
                                            $multiply: [{
                                                $divide: [
                                                    {
                                                        $subtract: [{ $toDate: tomorrow }, { $toDate: "$checkInDate" }]
                                                    },
                                                    1000 * 60 * 60 * 24
                                                ]
                                            }, "$noOfRooms"]
                                        },
                                        else: {
                                            $multiply: [{
                                                $divide: [
                                                    {
                                                        $subtract: [{ $toDate: "$checkOutDate" }, { $toDate: firstDayofMonth }]
                                                    },
                                                    1000 * 60 * 60 * 24
                                                ]
                                            }, "$noOfRooms"]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }, {
            $project: {
                checkInDate: 1,
                checkOutDate: 1,
                totalDays: 1,
                noOfRooms: 1,
                occupiedRooms: 1,
                groupRooms: {
                    $cond: {
                        if: { $gt: ["$noOfRooms", 1] }
                        , then: {
                            $divide: ["$occupiedRooms", "$noOfRooms"]
                        },
                        else: 0
                    }
                }
            }

        }, {
            $group: {
                _id: null,
                occupiedRooms: { $sum: "$occupiedRooms" },
                groupRooms: { $sum: "$groupRooms" }
            }

        }]

        const aggToGetTotalOccupiedRoomsLastYearPeriodToDate = [{
            $match: {
                checkInDate: { $lt: lastYearTommorow },
                checkOutDate: { $gt: lastYearTodayFirstdayofmonth }
            }
        },
        {
            $project: {
                checkInDate: 1,
                checkOutDate: 1,
                noOfRooms: 1,
                totalDays: 1
            }
        }, {
            $project: {
                checkInDate: 1,
                checkOutDate: 1,
                totalDays: 1,
                noOfRooms: 1,
                occupiedRooms: {
                    $cond: {
                        if: {
                            $and: [
                                { $lt: ["$checkInDate", lastYearTodayFirstdayofmonth] },
                                { $gt: ["$checkOutDate", lastYearToday] }
                            ]
                        },
                        then: { $multiply: ["$noOfRooms", periodtodays_numberOfDays] },
                        else: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$checkInDate", lastYearTodayFirstdayofmonth] },
                                        { $lte: ["$checkOutDate", lastYearTommorow] }
                                    ]
                                },
                                then: { $multiply: ["$noOfRooms", "$totalDays"] },
                                else: {
                                    $cond: {
                                        if: {
                                            $gt: ["$checkOutDate", lastYearTommorow]
                                        },
                                        then: {
                                            $multiply: [{
                                                $divide: [
                                                    {
                                                        $subtract: [{ $toDate: lastYearTommorow }, { $toDate: "$checkInDate" }]
                                                    },
                                                    1000 * 60 * 60 * 24
                                                ]
                                            }, "$noOfRooms"]
                                        },
                                        else: {
                                            $multiply: [{
                                                $divide: [
                                                    {
                                                        $subtract: [{ $toDate: "$checkOutDate" }, { $toDate: lastYearTodayFirstdayofmonth }]
                                                    },
                                                    1000 * 60 * 60 * 24
                                                ]
                                            }, "$noOfRooms"]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }, {
            $project: {
                checkInDate: 1,
                checkOutDate: 1,
                totalDays: 1,
                noOfRooms: 1,
                occupiedRooms: 1,
                groupRooms: {
                    $cond: {
                        if: { $gt: ["$noOfRooms", 1] }
                        , then: {
                            $divide: ["$occupiedRooms", "$noOfRooms"]
                        },
                        else: 0
                    }
                }
            }

        }, {
            $group: {
                _id: null,
                occupiedRooms: { $sum: "$occupiedRooms" },
                groupRooms: { $sum: "$groupRooms" }
            }

        }]

        const aggToGetTotalOccupiedRoomsYearToDate = [{
            $match: {
                checkInDate: { $lte: currentDate },
                checkOutDate: { $gt: firstDayofYear }
            }
        },
        {
            $project: {
                checkInDate: 1,
                checkOutDate: 1,
                noOfRooms: 1,
                totalDays: 1
            }
        }, {
            $project: {
                checkInDate: 1,
                checkOutDate: 1,
                totalDays: 1,
                noOfRooms: 1,
                occupiedRooms: {
                    $cond: {
                        if: {
                            $and: [
                                { $lt: ["$checkInDate", firstDayofYear] },
                                { $gt: ["$checkOutDate", currentDate] }
                            ]
                        },
                        then: { $multiply: ["$noOfRooms", totalDaysFromFirstDayOfYearToToday] },
                        else: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$checkInDate", firstDayofYear] },
                                        { $lte: ["$checkOutDate", tomorrow] }
                                    ]
                                },
                                then: { $multiply: ["$noOfRooms", "$totalDays"] },
                                else: {
                                    $cond: {
                                        if: {
                                            $gt: ["$checkOutDate", tomorrow]
                                        },
                                        then: {
                                            $multiply: [{
                                                $divide: [
                                                    {
                                                        $subtract: [{ $toDate: tomorrow }, { $toDate: "$checkInDate" }]
                                                    },
                                                    1000 * 60 * 60 * 24
                                                ]
                                            }, "$noOfRooms"]
                                        },
                                        else: {
                                            $multiply: [{
                                                $divide: [
                                                    {
                                                        $subtract: [{ $toDate: "$checkOutDate" }, { $toDate: firstDayofYear }]
                                                    },
                                                    1000 * 60 * 60 * 24
                                                ]
                                            }, "$noOfRooms"]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }, {
            $project: {
                checkInDate: 1,
                checkOutDate: 1,
                totalDays: 1,
                noOfRooms: 1,
                occupiedRooms: 1,
                groupRooms: {
                    $cond: {
                        if: { $gt: ["$noOfRooms", 1] }
                        , then: {
                            $divide: ["$occupiedRooms", "$noOfRooms"]
                        },
                        else: 0
                    }
                }
            }

        }, {
            $group: {
                _id: null,
                occupiedRooms: { $sum: "$occupiedRooms" },
                groupRooms: { $sum: "$groupRooms" }
            }

        }]

        const aggToGetTotalOccupiedRoomsLastYearYearToDate = [{
            $match: {
                checkInDate: { $lte: lastYearToday },
                checkOutDate: { $gt: lastYearfirstday }
            }
        },
        {
            $project: {
                checkInDate: 1,
                checkOutDate: 1,
                noOfRooms: 1,
                totalDays: 1
            }
        }, {
            $project: {
                checkInDate: 1,
                checkOutDate: 1,
                totalDays: 1,
                noOfRooms: 1,
                occupiedRooms: {
                    $cond: {
                        if: {
                            $and: [
                                { $lt: ["$checkInDate", lastYearfirstday] },
                                { $gt: ["$checkOutDate", lastYearToday] }
                            ]
                        },
                        then: { $multiply: ["$noOfRooms", totalDaysFromFirstDayOfYearToToday] },
                        else: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$checkInDate", lastYearfirstday] },
                                        { $lte: ["$checkOutDate", lastYearTommorow] }
                                    ]
                                },
                                then: { $multiply: ["$noOfRooms", "$totalDays"] },
                                else: {
                                    $cond: {
                                        if: {
                                            $gt: ["$checkOutDate", lastYearTommorow]
                                        },
                                        then: {
                                            $multiply: [{
                                                $divide: [
                                                    {
                                                        $subtract: [{ $toDate: lastYearTommorow }, { $toDate: "$checkInDate" }]
                                                    },
                                                    1000 * 60 * 60 * 24
                                                ]
                                            }, "$noOfRooms"]
                                        },
                                        else: {
                                            $multiply: [{
                                                $divide: [
                                                    {
                                                        $subtract: [{ $toDate: "$checkOutDate" }, { $toDate: lastYearfirstday }]
                                                    },
                                                    1000 * 60 * 60 * 24
                                                ]
                                            }, "$noOfRooms"]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }, {
            $project: {
                checkInDate: 1,
                checkOutDate: 1,
                totalDays: 1,
                noOfRooms: 1,
                occupiedRooms: 1,
                groupRooms: {
                    $cond: {
                        if: { $gt: ["$noOfRooms", 1] }
                        , then: {
                            $divide: ["$occupiedRooms", "$noOfRooms"]
                        },
                        else: 0
                    }
                }
            }

        }, {
            $group: {
                _id: null,
                occupiedRooms: { $sum: "$occupiedRooms" },
                groupRooms: { $sum: "$groupRooms" }
            }

        }]

        const aggToFindRoomsInMaintenancePeriodToDate = [{
            $match: {
                $and: [
                    { createdAt: { $gte: firstDayofMonth } },
                    { createdAt: { $lte: currentDate } }
                ]
            }
        }, {
            $project: {
                createdAt: 1
            }
        }, {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
        ]

        const aggToFindRoomsInMaintenanceLastYearPeriodToDate = [{
            $match: {
                $and: [
                    { createdAt: { $gte: lastYearTodayFirstdayofmonth } },
                    { createdAt: { $lte: lastYearToday } }
                ]
            }
        }, {
            $project: {
                createdAt: 1
            }
        }, {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
        ]

        const aggToFindRoomsInMaintenanceYearToDate = [{
            $match: {
                $and: [
                    { createdAt: { $gte: firstDayofYear } },
                    { createdAt: { $lte: currentDate } }
                ]
            }
        }, {
            $project: {
                createdAt: 1
            }
        }, {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
        ]


        const aggToFindRoomsInMaintenanceLastYearYearToDate = [{
            $match: {
                $and: [
                    { createdAt: { $gte: lastYearfirstday } },
                    { createdAt: { $lte: lastYearToday } }
                ]
            }
        }, {
            $project: {
                createdAt: 1
            }
        }, {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
        ]


        const aggToFinddayUseRoomsPeriodToDate = [{
            $match: {
                checkInDate: { $gte: firstDayofMonth },
                checkOutDate: { $lte: tomorrow }
            }
        },
        {
            $match: {
                $expr: {
                    $eq: ["$checkInDate", "$checkOutDate"]
                }
            }
        }, {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }]

        const aggToFinddayUseRoomsLastYearPeriodToDate = [{
            $match: {
                checkInDate: { $gte: lastYearTodayFirstdayofmonth },
                checkOutDate: { $lte: lastYearTommorow }
            }
        },
        {
            $match: {
                $expr: {
                    $eq: ["$checkInDate", "$checkOutDate"]
                }
            }
        }, {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }]

        const aggToFinddayUseRoomsYearToDate = [{
            $match: {
                checkInDate: { $gte: firstDayofYear },
                checkOutDate: { $lte: tomorrow }
            }
        },
        {
            $match: {
                $expr: {
                    $eq: ["$checkInDate", "$checkOutDate"]
                }
            }
        }, {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }]

        const aggToFinddayUseRoomsLastYearYearToDate = [{
            $match: {
                checkInDate: { $gte: lastYearfirstday },
                checkOutDate: { $lte: lastYearTommorow }
            }
        },
        {
            $match: {
                $expr: {
                    $eq: ["$checkInDate", "$checkOutDate"]
                }
            }
        }, {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }]

        const aggToFindGroupRoomsLastYearToday = [{
            $match: {
                checkInDate: { $lte: lastYearToday },
                checkOutDate: { $gt: lastYearToday }
            }
        }, {
            $match: {
                noOfRooms: { $gt: 1 }
            }
        }, {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }]

        const aggToGetRoomsInMaintenenaceLastYearToday = [{
            $match: {
                createdAt: lastYearToday
            }
        }, {
            $group: {
                _id: null,
                rooms: { $sum: 1 }
            }
        }
        ]


        const guestActivityAggregation = ([
            {
                $facet: {
                    totalArrivalsToday: [
                        {
                            $match: {
                                checkInDate: currentDate
                            }
                        },
                        {
                            $project: {
                                isWalkIn: {
                                    $cond: {
                                        if: "$isWalkIn",
                                        then: 1,
                                        else: 0
                                    }
                                },
                                groupArrivals: {
                                    $cond: {
                                        if: { $gt: ["$noOfRooms", 1] },
                                        then: 1,
                                        else: 0
                                    }
                                },
                                checkInDate: 1
                            }
                        }, {
                            $group: {
                                _id: null,
                                isWalkInTodayCount: { $sum: "$isWalkIn" },
                                groupArrivalsTodayCount: { $sum: "$groupArrivals" },
                                TotalArrivalsTodaycount: { $sum: 1 }
                            }
                        }
                    ],
                    totalArrivalsPeriodToDate: [
                        {
                            $match: {
                                $and: [
                                    { checkInDate: { $gte: firstDayofMonth } },
                                    { checkInDate: { $lte: currentDate } }
                                ]
                            }
                        }, {
                            $project: {
                                isWalkIn: {
                                    $cond: {
                                        if: "$isWalkIn",
                                        then: 1,
                                        else: 0
                                    }
                                },
                                groupArrivals: {
                                    $cond: {
                                        if: { $gt: ["$noOfRooms", 1] },
                                        then: 1,
                                        else: 0
                                    }
                                },
                                checkInDate: 1
                            }
                        }, {
                            $group: {
                                _id: null,
                                isWalkIn: { $sum: "$isWalkIn" },
                                groupArrivals: { $sum: "$groupArrivals" },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    totalArrivalsYearToDate: [{
                        $match: {
                            $and: [
                                { checkInDate: { $gte: firstDayofYear } },
                                { checkInDate: { $lte: currentDate } }
                            ]
                        }
                    }, {
                        $project: {
                            isWalkIn: {
                                $cond: {
                                    if: "$isWalkIn",
                                    then: 1,
                                    else: 0
                                }
                            },
                            groupArrivals: {
                                $cond: {
                                    if: { $gt: ["$noOfRooms", 1] },
                                    then: 1,
                                    else: 0
                                }
                            },
                            checkInDate: 1
                        }
                    }, {
                        $group: {
                            _id: null,
                            isWalkIn: { $sum: "$isWalkIn" },
                            groupArrivals: { $sum: "$groupArrivals" },
                            count: { $sum: 1 }
                        }
                    }],
                    totalArrivalsLastYearToday: [{
                        $match: { checkInDate: '2023-08-10' }
                    },
                    {
                        $project: {
                            isWalkIn: {
                                $cond: {
                                    if: "$isWalkIn",
                                    then: 1,
                                    else: 0
                                }
                            },
                            groupArrivals: {
                                $cond: {
                                    if: { $gt: ["$noOfRooms", 1] },
                                    then: 1,
                                    else: 0
                                }
                            },
                            checkInDate: 1
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            isWalkIn: { $sum: "$isWalkIn" },
                            groupArrivals: { $sum: "$groupArrivals" },
                            count: { $sum: 1 }
                        }
                    }],
                    totalArrivalsLastYearPeriodToDate: [{
                        $match: {
                            $and: [
                                { checkInDate: { $gte: lastYearTodayFirstdayofmonth } },
                                { checkInDate: { $lte: lastYearToday } }
                            ]
                        }
                    }, {
                        $project: {
                            isWalkIn: {
                                $cond: {
                                    if: "$isWalkIn",
                                    then: 1,
                                    else: 0
                                }
                            },
                            groupArrivals: {
                                $cond: {
                                    if: { $gt: ["$noOfRooms", 1] },
                                    then: 1,
                                    else: 0
                                }
                            },
                            checkInDate: 1
                        }
                    }, {
                        $group: {
                            _id: null,
                            isWalkIn: { $sum: "$isWalkIn" },
                            groupArrivals: { $sum: "$groupArrivals" },
                            count: { $sum: 1 }
                        }
                    }],
                    totalArrivalsLastYearYearToDate: [{
                        $match: {
                            $and: [
                                { checkInDate: { $gte: lastYearfirstday } },
                                { checkInDate: { $lte: lastYearToday } }
                            ]
                        }
                    }, {
                        $project: {
                            isWalkIn: {
                                $cond: {
                                    if: "$isWalkIn",
                                    then: 1,
                                    else: 0
                                }
                            },
                            groupArrivals: {
                                $cond: {
                                    if: { $gt: ["$noOfRooms", 1] },
                                    then: 1,
                                    else: 0
                                }
                            },
                            checkInDate: 1
                        }
                    }, {
                        $group: {
                            _id: null,
                            isWalkIn: { $sum: "$isWalkIn" },
                            groupArrivals: { $sum: "$groupArrivals" },
                            count: { $sum: 1 }
                        }
                    }],
                    departuresToday: [{
                        $match: {
                            checkOutDate: currentDate
                        }
                    }, {
                        $project: {
                            checkOutDate: 1,
                            groupDepartures: {
                                $cond: {
                                    if: { $gt: ["$noOfRooms", 1] },
                                    then: 1,
                                    else: 0
                                }
                            }
                        }
                    }, {
                        $group: {
                            _id: null,
                            count: { $sum: 1 },
                            groupDepartures: { $sum: "$groupDepartures" }
                        }
                    }
                    ],
                    departuresPeriodToDate: [
                        {
                            $match: {
                                $and: [
                                    { checkOutDate: { $gte: firstDayofMonth } },
                                    { checkOutDate: { $lte: currentDate } }
                                ]
                            }
                        }, {
                            $project: {
                                checkOutDate: 1,
                                groupDepartures: {
                                    $cond: {
                                        if: { $gt: ["$noOfRooms", 1] },
                                        then: 1,
                                        else: 0
                                    }
                                }
                            }
                        }, {
                            $group: {
                                _id: null,
                                count: { $sum: 1 },
                                groupDepartures: { $sum: "$groupDepartures" }
                            }
                        }
                    ],
                    departuresYearToDate: [
                        {
                            $match: {
                                $and: [
                                    { checkOutDate: { $gte: firstDayofYear } },
                                    { checkOutDate: { $lte: currentDate } }
                                ]
                            }
                        }, {
                            $project: {
                                checkOutDate: 1,
                                groupDepartures: {
                                    $cond: {
                                        if: { $gt: ["$noOfRooms", 1] },
                                        then: 1,
                                        else: 0
                                    }
                                }
                            }
                        }, {
                            $group: {
                                _id: null,
                                count: { $sum: 1 },
                                groupDepartures: { $sum: "$groupDepartures" }
                            }
                        }
                    ],
                    departuresLastYearToday: [{
                        $match: {
                            checkOutDate: lastYearToday
                        }
                    }, {
                        $project: {
                            checkOutDate: 1,
                            groupDepartures: {
                                $cond: {
                                    if: { $gt: ["$noOfRooms", 1] },
                                    then: 1,
                                    else: 0
                                }
                            }
                        }
                    }, {
                        $group: {
                            _id: null,
                            count: { $sum: 1 },
                            groupDepartures: { $sum: "$groupDepartures" }
                        }
                    }
                    ],
                    departuresLastYearPeriodToDate: [
                        {
                            $match: {
                                $and: [
                                    { checkOutDate: { $gte: lastYearTodayFirstdayofmonth } },
                                    { checkOutDate: { $lte: lastYearToday } }
                                ]
                            }
                        }, {
                            $project: {
                                checkOutDate: 1,
                                groupDepartures: {
                                    $cond: {
                                        if: { $gt: ["$noOfRooms", 1] },
                                        then: 1,
                                        else: 0
                                    }
                                }
                            }
                        }, {
                            $group: {
                                _id: null,
                                count: { $sum: 1 },
                                groupDepartures: { $sum: "$groupDepartures" }
                            }
                        }
                    ],
                    departuresLastYearYearToDate: [
                        {
                            $match: {
                                $and: [
                                    { checkOutDate: { $gte: lastYearfirstday } },
                                    { checkOutDate: { $lte: lastYearToday } }
                                ]
                            }
                        }, {
                            $project: {
                                checkOutDate: 1,
                                groupDepartures: {
                                    $cond: {
                                        if: { $gt: ["$noOfRooms", 1] },
                                        then: 1,
                                        else: 0
                                    }
                                }
                            }
                        }, {
                            $group: {
                                _id: null,
                                count: { $sum: 1 },
                                groupDepartures: { $sum: "$groupDepartures" }
                            }
                        }
                    ],

                    averageLosToday: [{
                        $match: {
                            checkInDate: currentDate,
                        }
                    }, {
                        $project: {
                            totalDays: 1
                        }
                    }, {
                        $group: {
                            _id: null,
                            totalDays: { $sum: "$totalDays" },
                            count: { $sum: 1 }
                        }
                    }, {
                        $project: {
                            avgLos: { $divide: ["$totalDays", "$count"] }
                        }
                    }],

                    averageLosPeriodToDate: [{
                        $match: {
                            $and: [
                                { checkInDate: { $gte: firstDayofMonth } },
                                { checkInDate: { $lte: currentDate } }
                            ]
                        }
                    }, {
                        $project: {
                            totalDays: 1
                        }
                    }, {
                        $group: {
                            _id: null,
                            totalDays: { $sum: "$totalDays" },
                            count: { $sum: 1 }
                        }
                    }, {
                        $project: {
                            avgLos: { $divide: ["$totalDays", "$count"] }
                        }
                    }],

                    averageLosYearToDate: [{
                        $match: {
                            $and: [
                                { checkInDate: { $gte: firstDayofYear } },
                                { checkInDate: { $lte: currentDate } }
                            ]
                        }
                    }, {
                        $project: {
                            totalDays: 1
                        }
                    }, {
                        $group: {
                            _id: null,
                            totalDays: { $sum: "$totalDays" },
                            count: { $sum: 1 }
                        }
                    }, {
                        $project: {
                            avgLos: { $divide: ["$totalDays", "$count"] }
                        }
                    }],

                    averageLosLastYearToday: [{
                        $match: {
                            checkInDate: lastYearToday,
                        }
                    }, {
                        $project: {
                            totalDays: 1
                        }
                    }, {
                        $group: {
                            _id: null,
                            totalDays: { $sum: "$totalDays" },
                            count: { $sum: 1 }
                        }
                    }, {
                        $project: {
                            avgLos: { $divide: ["$totalDays", "$count"] }
                        }
                    }],

                    averageLosLastYearPeriodToDate: [{
                        $match: {
                            $and: [
                                { checkInDate: { $gte: lastYearTodayFirstdayofmonth } },
                                { checkInDate: { $lte: lastYearToday } }
                            ]
                        }
                    }, {
                        $project: {
                            totalDays: 1
                        }
                    }, {
                        $group: {
                            _id: null,
                            totalDays: { $sum: "$totalDays" },
                            count: { $sum: 1 }
                        }
                    }, {
                        $project: {
                            avgLos: { $divide: ["$totalDays", "$count"] }
                        }
                    }],
                    averageLosLastYearYearToDate: [{
                        $match: {
                            $and: [
                                { checkInDate: { $gte: lastYearfirstday } },
                                { checkInDate: { $lte: lastYearToday } }
                            ]
                        }
                    }, {
                        $project: {
                            totalDays: 1
                        }
                    }, {
                        $group: {
                            _id: null,
                            totalDays: { $sum: "$totalDays" },
                            count: { $sum: 1 }
                        }
                    }, {
                        $project: {
                            avgLos: { $divide: ["$totalDays", "$count"] }
                        }
                    }],

                }
            }
        ])


        const Statistics = ([
            {
                $facet:
                {
                    RoomsSoldToday: [{
                        $match: {
                            $and: [
                                { checkInDate: { $lte: currentDate } },
                                { checkOutDate: { $gt: currentDate } }
                            ]
                        }
                    }, {
                        $project: {
                            checkInDate: 1,
                            checkOutDate: 1,
                            noOfRooms: 1
                        }
                    }, {
                        $group: {
                            _id: null,
                            noOfRooms: { $sum: "$noOfRooms" }
                        }
                    }
                    ],

                    RoomsSoldPeriodToDate: [{
                        $match: {
                            $and: [
                                { checkInDate: { $lt: tomorrow } },
                                { checkOutDate: { $gt: firstDayofMonth } }
                            ]
                        }
                    },
                    {
                        $project: {
                            checkInDate: 1,
                            checkOutDate: 1,
                            noOfRooms: 1,
                            totalDays: 1
                        }
                    }
                        , {
                        $project: {
                            checkInDate: 1,
                            checkOutDate: 1,
                            noOfRooms: 1,
                            totalDays: 1,
                            roomsSold: {
                                $cond: {
                                    if: {
                                        $and: [
                                            { $gte: ["$checkInDate", firstDayofMonth] },
                                            { $lte: ["$checkOutDate", tomorrow] }
                                        ]
                                    }, then: { $multiply: ["$noOfRooms", "$totalDays"] },
                                    else: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    { $lt: ["$checkInDate", firstDayofMonth] },
                                                    { $gt: ["$checkOutDate", tomorrow] }
                                                ]
                                            },
                                            then: { $multiply: ["$noOfRooms", periodtodays_numberOfDays] },
                                            else: {
                                                $cond: {
                                                    if: { $lt: ["$checkInDate", firstDayofMonth] },
                                                    then: {
                                                        $multiply: [{
                                                            $divide: [
                                                                {
                                                                    $subtract: [{ $toDate: "$checkOutDate" }, { $toDate: firstDayofMonth }]
                                                                },
                                                                1000 * 60 * 60 * 24
                                                            ]
                                                        }, "$noOfRooms"]
                                                    },
                                                    else: {
                                                        $multiply: [{
                                                            $divide: [
                                                                {
                                                                    $subtract: [{ $toDate: tomorrow }, { $toDate: "$checkInDate" }]
                                                                },
                                                                1000 * 60 * 60 * 24
                                                            ]
                                                        }, "$noOfRooms"]
                                                    },
                                                },
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }, {
                        $group: {
                            _id: null,
                            roomsSold: { $sum: "$roomsSold" }
                        }
                    }
                    ],
                    RoomsSoldYearToDate: [{
                        $match: {
                            $and: [
                                { checkInDate: { $lt: tomorrow } },
                                { checkOutDate: { $gt: firstDayofYear } }
                            ]
                        }
                    },
                    {
                        $project: {
                            checkInDate: 1,
                            checkOutDate: 1,
                            noOfRooms: 1,
                            totalDays: 1
                        }
                    }
                        , {
                        $project: {
                            checkInDate: 1,
                            checkOutDate: 1,
                            noOfRooms: 1,
                            totalDays: 1,
                            roomsSold: {
                                $cond: {
                                    if: {
                                        $and: [
                                            { $gte: ["$checkInDate", firstDayofYear] },
                                            { $lte: ["$checkOutDate", tomorrow] }
                                        ]
                                    }, then: { $multiply: ["$noOfRooms", "$totalDays"] },
                                    else: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    { $lt: ["$checkInDate", firstDayofYear] },
                                                    { $gt: ["$checkOutDate", tomorrow] }
                                                ]
                                            },
                                            then: { $multiply: ["$noOfRooms", totalDaysFromFirstDayOfYearToToday] },
                                            else: {
                                                $cond: {
                                                    if: { $lt: ["$checkInDate", firstDayofYear] },
                                                    then: {
                                                        $multiply: [{
                                                            $divide: [
                                                                {
                                                                    $subtract: [{ $toDate: "$checkOutDate" }, { $toDate: firstDayofYear }]
                                                                },
                                                                1000 * 60 * 60 * 24
                                                            ]
                                                        }, "$noOfRooms"]
                                                    },
                                                    else: {
                                                        $multiply: [{
                                                            $divide: [
                                                                {
                                                                    $subtract: [{ $toDate: tomorrow }, { $toDate: "$checkInDate" }]
                                                                },
                                                                1000 * 60 * 60 * 24
                                                            ]
                                                        }, "$noOfRooms"]
                                                    },
                                                },
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }, {
                        $group: {
                            _id: null,
                            roomsSold: { $sum: "$roomsSold" }
                        }
                    }
                    ],
                    RoomsSoldLastYearToday: [{
                        $match: {
                            $and: [
                                { checkInDate: { $lte: lastYearToday } },
                                { checkOutDate: { $gt: lastYearToday } }
                            ]
                        }
                    }, {
                        $project: {
                            checkInDate: 1,
                            checkOutDate: 1,
                            noOfRooms: 1
                        }
                    }, {
                        $group: {
                            _id: null,
                            noOfRooms: { $sum: "$noOfRooms" }
                        }
                    }
                    ],
                    RoomsSoldLastYearPeriodToDate: [{
                        $match: {
                            $and: [
                                { checkInDate: { $lt: lastYearTommorow } },
                                { checkOutDate: { $gt: lastYearTodayFirstdayofmonth } }
                            ]
                        }
                    },
                    {
                        $project: {
                            checkInDate: 1,
                            checkOutDate: 1,
                            noOfRooms: 1,
                            totalDays: 1
                        }
                    }
                        , {
                        $project: {
                            checkInDate: 1,
                            checkOutDate: 1,
                            noOfRooms: 1,
                            totalDays: 1,
                            roomsSold: {
                                $cond: {
                                    if: {
                                        $and: [
                                            { $gte: ["$checkInDate", lastYearTodayFirstdayofmonth] },
                                            { $lte: ["$checkOutDate", lastYearTommorow] }
                                        ]
                                    }, then: { $multiply: ["$noOfRooms", "$totalDays"] },
                                    else: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    { $lt: ["$checkInDate", firstDayofMonth] },
                                                    { $gt: ["$checkOutDate", tomorrow] }
                                                ]
                                            },
                                            then: { $multiply: ["$noOfRooms", 10] },
                                            else: {
                                                $cond: {
                                                    if: { $lt: ["$checkInDate", lastYearTodayFirstdayofmonth] },
                                                    then: {
                                                        $multiply: [{
                                                            $divide: [
                                                                {
                                                                    $subtract: [{ $toDate: "$checkOutDate" }, { $toDate: lastYearTodayFirstdayofmonth }]
                                                                },
                                                                1000 * 60 * 60 * 24
                                                            ]
                                                        }, "$noOfRooms"]
                                                    },
                                                    else: {
                                                        $multiply: [{
                                                            $divide: [
                                                                {
                                                                    $subtract: [{ $toDate: tomorrow }, { $toDate: "$checkInDate" }]
                                                                },
                                                                1000 * 60 * 60 * 24
                                                            ]
                                                        }, "$noOfRooms"]
                                                    },
                                                },
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }, {
                        $group: {
                            _id: null,
                            roomsSold: { $sum: "$roomsSold" }
                        }
                    }
                    ],
                    RoomsSoldLastYearYearToDate: [{
                        $match: {
                            $and: [
                                { checkInDate: { $lt: lastYearTommorow } },
                                { checkOutDate: { $gt: lastYearfirstday } }
                            ]
                        }
                    },
                    {
                        $project: {
                            checkInDate: 1,
                            checkOutDate: 1,
                            noOfRooms: 1,
                            totalDays: 1
                        }
                    }
                        , {
                        $project: {
                            checkInDate: 1,
                            checkOutDate: 1,
                            noOfRooms: 1,
                            totalDays: 1,
                            roomsSold: {
                                $cond: {
                                    if: {
                                        $and: [
                                            { $gte: ["$checkInDate", lastYearfirstday] },
                                            { $lte: ["$checkOutDate", lastYearTommorow] }
                                        ]
                                    }, then: { $multiply: ["$noOfRooms", "$totalDays"] },
                                    else: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    { $lt: ["$checkInDate", lastYearfirstday] },
                                                    { $gt: ["$checkOutDate", lastYearTommorow] }
                                                ]
                                            },
                                            then: { $multiply: ["$noOfRooms", totalDaysFromFirstDayOfYearToToday] },
                                            else: {
                                                $cond: {
                                                    if: { $lt: ["$checkInDate", lastYearfirstday] },
                                                    then: {
                                                        $multiply: [{
                                                            $divide: [
                                                                {
                                                                    $subtract: [{ $toDate: "$checkOutDate" }, { $toDate: lastYearfirstday }]
                                                                },
                                                                1000 * 60 * 60 * 24
                                                            ]
                                                        }, "$noOfRooms"]
                                                    },
                                                    else: {
                                                        $multiply: [{
                                                            $divide: [
                                                                {
                                                                    $subtract: [{ $toDate: lastYearTommorow }, { $toDate: "$checkInDate" }]
                                                                },
                                                                1000 * 60 * 60 * 24
                                                            ]
                                                        }, "$noOfRooms"]
                                                    },
                                                },
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }, {
                        $group: {
                            _id: null,
                            roomsSold: { $sum: "$roomsSold" }
                        }
                    }
                    ],
                    ADR_Net_room_Today: [
                        {
                            $match: {
                                checkInDate: { $lte: currentDate },
                                checkOutDate: { $gt: currentDate },
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                roomTotal: 1,
                                totalDays: 1,
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                roomTotal: {
                                    $divide: [{ $toDouble: "$roomTotal" }, "$totalDays"],
                                },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                noOfRooms: { $sum: "$noOfRooms" },
                                roomTotal: { $sum: "$roomTotal" },
                            },
                        },
                        {
                            $project: {
                                adr: { $divide: ["$roomTotal", "$noOfRooms"] },
                                roomTotal: 1
                            },
                        },
                    ],
                    ADR_Gross_room_Today: [
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
                                adr: { $divide: ["$totalPrice", "$noOfRooms"] },
                                totalPrice: 1
                            },
                        },
                    ],
                    Adr_Net_room_PeriodToDate: [
                        {
                            $match: {
                                checkInDate: { $lt: currentDate },
                                checkOutDate: { $gt: firstDayofMonth },
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $toDouble: "$roomTotal" },
                                checkInDate: 1,
                                checkOutDate: 1,
                                totalDays: 1,
                                totalDaydiff: {
                                    $cond: {
                                        if: { $lt: ["$checkInDate", firstDayofMonth] },
                                        then: {
                                            $dateDiff: {
                                                startDate: { $toDate: firstDayofMonth },
                                                endDate: { $toDate: "$checkOutDate" },
                                                unit: "day",
                                            },
                                        },
                                        else: {
                                            $cond: {
                                                if: {
                                                    $gt: ["$checkOutDate", currentDate],
                                                },
                                                then: {
                                                    $dateDiff: {
                                                        startDate: { $toDate: "$checkInDate" },
                                                        endDate: { $toDate: currentDate },
                                                        unit: "day",
                                                    },
                                                },
                                                else: "$totalDays",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $divide: ["$totalPrice", "$totalDays"] },
                                totalDaydiff: 1,
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $multiply: ["$totalPrice", "$totalDaydiff"] },
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
                                adr: { $divide: ["$totalPrice", "$noOfRooms"] },
                                totalPrice: 1
                            },
                        },
                    ],
                    Adr_Gross_room_PeriodToDate: [
                        {
                            $match: {
                                checkInDate: { $lt: currentDate },
                                checkOutDate: { $gt: firstDayofMonth },
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $toDouble: "$totalPrice" },
                                checkInDate: 1,
                                checkOutDate: 1,
                                totalDays: 1,
                                totalDaydiff: {
                                    $cond: {
                                        if: { $lt: ["$checkInDate", firstDayofMonth] },
                                        then: {
                                            $dateDiff: {
                                                startDate: { $toDate: firstDayofMonth },
                                                endDate: { $toDate: "$checkOutDate" },
                                                unit: "day",
                                            },
                                        },
                                        else: {
                                            $cond: {
                                                if: {
                                                    $gt: ["$checkOutDate", currentDate],
                                                },
                                                then: {
                                                    $dateDiff: {
                                                        startDate: { $toDate: "$checkInDate" },
                                                        endDate: { $toDate: currentDate },
                                                        unit: "day",
                                                    },
                                                },
                                                else: "$totalDays",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $divide: ["$totalPrice", "$totalDays"] },
                                totalDaydiff: 1,
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $multiply: ["$totalPrice", "$totalDaydiff"] },
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
                                adr: { $divide: ["$totalPrice", "$noOfRooms"] },
                                totalPrice: 1
                            },
                        },
                    ],
                    Adr_Net_room_YearToDate: [
                        {
                            $match: {
                                checkInDate: { $lt: currentDate },
                                checkOutDate: { $gt: firstDayofYear },
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $toDouble: "$roomTotal" },
                                checkInDate: 1,
                                checkOutDate: 1,
                                totalDays: 1,
                                totalDaydiff: {
                                    $cond: {
                                        if: { $lt: ["$checkInDate", firstDayofYear] },
                                        then: {
                                            $dateDiff: {
                                                startDate: { $toDate: firstDayofYear },
                                                endDate: { $toDate: "$checkOutDate" },
                                                unit: "day",
                                            },
                                        },
                                        else: {
                                            $cond: {
                                                if: {
                                                    $gt: ["$checkOutDate", currentDate],
                                                },
                                                then: {
                                                    $dateDiff: {
                                                        startDate: { $toDate: "$checkInDate" },
                                                        endDate: { $toDate: currentDate },
                                                        unit: "day",
                                                    },
                                                },
                                                else: "$totalDays",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $divide: ["$totalPrice", "$totalDays"] },
                                totalDaydiff: 1,
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $multiply: ["$totalPrice", "$totalDaydiff"] },
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
                                adr: { $divide: ["$totalPrice", "$noOfRooms"] },
                                totalPrice: 1
                            },
                        },
                    ],
                    Adr_Gross_room_YearToDate: [
                        {
                            $match: {
                                checkInDate: { $lt: currentDate },
                                checkOutDate: { $gt: firstDayofYear },
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $toDouble: "$totalPrice" },
                                checkInDate: 1,
                                checkOutDate: 1,
                                totalDays: 1,
                                totalDaydiff: {
                                    $cond: {
                                        if: { $lt: ["$checkInDate", firstDayofYear] },
                                        then: {
                                            $dateDiff: {
                                                startDate: { $toDate: firstDayofYear },
                                                endDate: { $toDate: "$checkOutDate" },
                                                unit: "day",
                                            },
                                        },
                                        else: {
                                            $cond: {
                                                if: {
                                                    $gt: ["$checkOutDate", currentDate],
                                                },
                                                then: {
                                                    $dateDiff: {
                                                        startDate: { $toDate: "$checkInDate" },
                                                        endDate: { $toDate: currentDate },
                                                        unit: "day",
                                                    },
                                                },
                                                else: "$totalDays",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $divide: ["$totalPrice", "$totalDays"] },
                                totalDaydiff: 1,
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $multiply: ["$totalPrice", "$totalDaydiff"] },
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
                                adr: { $divide: ["$totalPrice", "$noOfRooms"] },
                                totalPrice: 1
                            },
                        },
                    ],
                    ADR_Net_room_LastYearToday: [
                        {
                            $match: {
                                checkInDate: { $lte: lastYearToday },
                                checkOutDate: { $gt: lastYearToday },
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                roomTotal: 1,
                                totalDays: 1,
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                roomTotal: {
                                    $divide: [{ $toDouble: "$roomTotal" }, "$totalDays"],
                                },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                noOfRooms: { $sum: "$noOfRooms" },
                                roomTotal: { $sum: "$roomTotal" },
                            },
                        },
                        {
                            $project: {
                                adr: { $divide: ["$roomTotal", "$noOfRooms"] },
                                roomTotal: 1
                            },
                        },
                    ],
                    ADR_Gross_room_LastYearToday: [
                        {
                            $match: {
                                checkInDate: { $lte: lastYearToday },
                                checkOutDate: { $gt: lastYearToday },
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
                                adr: { $divide: ["$totalPrice", "$noOfRooms"] },
                                totalPrice: 1
                            },
                        },
                    ],
                    Adr_Net_room_LastYearPeriodToDate: [
                        {
                            $match: {
                                checkInDate: { $lt: lastYearToday },
                                checkOutDate: { $gt: lastYearTodayFirstdayofmonth },
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $toDouble: "$roomTotal" },
                                checkInDate: 1,
                                checkOutDate: 1,
                                totalDays: 1,
                                totalDaydiff: {
                                    $cond: {
                                        if: { $lt: ["$checkInDate", lastYearTodayFirstdayofmonth] },
                                        then: {
                                            $dateDiff: {
                                                startDate: { $toDate: lastYearTodayFirstdayofmonth },
                                                endDate: { $toDate: "$checkOutDate" },
                                                unit: "day",
                                            },
                                        },
                                        else: {
                                            $cond: {
                                                if: {
                                                    $gt: ["$checkOutDate", lastYearToday],
                                                },
                                                then: {
                                                    $dateDiff: {
                                                        startDate: { $toDate: "$checkInDate" },
                                                        endDate: { $toDate: lastYearToday },
                                                        unit: "day",
                                                    },
                                                },
                                                else: "$totalDays",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $divide: ["$totalPrice", "$totalDays"] },
                                totalDaydiff: 1,
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $multiply: ["$totalPrice", "$totalDaydiff"] },
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
                                adr: { $divide: ["$totalPrice", "$noOfRooms"] },
                                totalPrice: 1
                            },
                        },
                    ],
                    Adr_Gross_room_LastYearPeriodToDate: [
                        {
                            $match: {
                                checkInDate: { $lt: lastYearToday },
                                checkOutDate: { $gt: lastYearTodayFirstdayofmonth },
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $toDouble: "$totalPrice" },
                                checkInDate: 1,
                                checkOutDate: 1,
                                totalDays: 1,
                                totalDaydiff: {
                                    $cond: {
                                        if: { $lt: ["$checkInDate", lastYearTodayFirstdayofmonth] },
                                        then: {
                                            $dateDiff: {
                                                startDate: { $toDate: lastYearTodayFirstdayofmonth },
                                                endDate: { $toDate: "$checkOutDate" },
                                                unit: "day",
                                            },
                                        },
                                        else: {
                                            $cond: {
                                                if: {
                                                    $gt: ["$checkOutDate", lastYearToday],
                                                },
                                                then: {
                                                    $dateDiff: {
                                                        startDate: { $toDate: "$checkInDate" },
                                                        endDate: { $toDate: lastYearToday },
                                                        unit: "day",
                                                    },
                                                },
                                                else: "$totalDays",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $divide: ["$totalPrice", "$totalDays"] },
                                totalDaydiff: 1,
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $multiply: ["$totalPrice", "$totalDaydiff"] },
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
                                adr: { $divide: ["$totalPrice", "$noOfRooms"] },
                                totalPrice: 1
                            },
                        },
                    ],
                    Adr_Net_room_LastYearYearToDate: [
                        {
                            $match: {
                                checkInDate: { $lt: lastYearToday },
                                checkOutDate: { $gt: lastYearfirstday },
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $toDouble: "$roomTotal" },
                                checkInDate: 1,
                                checkOutDate: 1,
                                totalDays: 1,
                                totalDaydiff: {
                                    $cond: {
                                        if: { $lt: ["$checkInDate", lastYearfirstday] },
                                        then: {
                                            $dateDiff: {
                                                startDate: { $toDate: lastYearfirstday },
                                                endDate: { $toDate: "$checkOutDate" },
                                                unit: "day",
                                            },
                                        },
                                        else: {
                                            $cond: {
                                                if: {
                                                    $gt: ["$checkOutDate", lastYearToday],
                                                },
                                                then: {
                                                    $dateDiff: {
                                                        startDate: { $toDate: "$checkInDate" },
                                                        endDate: { $toDate: lastYearToday },
                                                        unit: "day",
                                                    },
                                                },
                                                else: "$totalDays",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $divide: ["$totalPrice", "$totalDays"] },
                                totalDaydiff: 1,
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $multiply: ["$totalPrice", "$totalDaydiff"] },
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
                                adr: { $divide: ["$totalPrice", "$noOfRooms"] },
                                totalPrice: 1
                            },
                        },
                    ],
                    Adr_Gross_room_LastYearYearToDate: [
                        {
                            $match: {
                                checkInDate: { $lt: lastYearToday },
                                checkOutDate: { $gt: lastYearfirstday },
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $toDouble: "$totalPrice" },
                                checkInDate: 1,
                                checkOutDate: 1,
                                totalDays: 1,
                                totalDaydiff: {
                                    $cond: {
                                        if: { $lt: ["$checkInDate", lastYearfirstday] },
                                        then: {
                                            $dateDiff: {
                                                startDate: { $toDate: lastYearfirstday },
                                                endDate: { $toDate: "$checkOutDate" },
                                                unit: "day",
                                            },
                                        },
                                        else: {
                                            $cond: {
                                                if: {
                                                    $gt: ["$checkOutDate", lastYearToday],
                                                },
                                                then: {
                                                    $dateDiff: {
                                                        startDate: { $toDate: "$checkInDate" },
                                                        endDate: { $toDate: lastYearToday },
                                                        unit: "day",
                                                    },
                                                },
                                                else: "$totalDays",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $divide: ["$totalPrice", "$totalDays"] },
                                totalDaydiff: 1,
                            },
                        },
                        {
                            $project: {
                                noOfRooms: 1,
                                totalPrice: { $multiply: ["$totalPrice", "$totalDaydiff"] },
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
                                adr: { $divide: ["$totalPrice", "$noOfRooms"] },
                                totalPrice: 1
                            },
                        },
                    ],

                }
            }])


        const getRoomRevenueToday = await connection.db.collection("bookings").aggregate(aggregationToGetRoomRevenueforToday).toArray();
        const getRoomRevenuePeriodToDate = await connection.db.collection("bookings").aggregate(aggregationToGetRoomRevenueforPeriodToDate).toArray();
        const getRoomRevenueYearToDate = await connection.db.collection("bookings").aggregate(aggregationToGetRoomRevenueforYearToDate).toArray();
        const getRoomRevenueLastYearToday = await connection.db.collection("bookings").aggregate(aggregationToGetRoomRevenueforLastYearToday).toArray();
        const getRoomRevenueLastYearPTD = await connection.db.collection("bookings").aggregate(aggregationToGetRoomRevenueforLastYearPeriodToDate).toArray();
        const getRoomRevenueLastYTD = await connection.db.collection("bookings").aggregate(aggregationToGetRoomRevenueforLastYTD).toArray();
        const numberOfRoomsOfEveryType = await connection.db.collection("rooms").aggregate(aggToGetTotalRoomsOfEveryType).toArray();
        const occupiedRoomsToday = await connection.db.collection("bookings").aggregate(aggTogetOccupiedRoomsToday).toArray();
        const groupRoomsToday = await connection.db.collection("bookings").aggregate(aggregationToGetTotalNumberofGroupRoomsToday).toArray();
        const maintenanceRoomsToday = await connection.db.collection("maintenance").aggregate(aggToGetRoomsInMaintenenaceToday).toArray();
        const dayUseRoomsToday = await connection.db.collection("bookings").aggregate(aggrToGetDayUseRoomsToday).toArray();
        const totalOccupiedRoomsPeriodToDate = await connection.db.collection("bookings").aggregate(aggToGetTotalOccupiedRoomsPeriodToDate).toArray();
        const totalOccupiedRoomsYearToDate = await connection.db.collection("bookings").aggregate(aggToGetTotalOccupiedRoomsYearToDate).toArray();

        const maintenanceRoomsPeriodToDate = await connection.db.collection("maintenance").aggregate(aggToFindRoomsInMaintenancePeriodToDate).toArray();
        const maintenanceRoomsYearToDate = await connection.db.collection("maintenance").aggregate(aggToFindRoomsInMaintenanceYearToDate).toArray();

        const dayUseRoomsPeriodToDate = await connection.db.collection("bookings").aggregate(aggToFinddayUseRoomsPeriodToDate).toArray();
        const dayUseRoomsYearToDate = await connection.db.collection("bookings").aggregate(aggToFinddayUseRoomsYearToDate).toArray();

        const occupiedRoomsLastYearToday = await connection.db.collection("bookings").aggregate(aggTogetOccupiedRoomsLastYearToday).toArray();
        const groupRoomslastYearToday = await connection.db.collection("bookings").aggregate(aggToFindGroupRoomsLastYearToday).toArray();

        const maintenanceRoomsLastYearToday = await connection.db.collection("maintenance").aggregate(aggToGetRoomsInMaintenenaceLastYearToday).toArray();
        const dayUseRoomsLastYearToday = await connection.db.collection("bookings").aggregate(aggrToGetDayUseRoomsLastYearToday).toArray();

        const totalOccupiedRoomsLastYearPeriodToDate = await connection.db.collection("bookings").aggregate(aggToGetTotalOccupiedRoomsLastYearPeriodToDate).toArray();

        const maintenanceRoomsLastYearPeriodToDate = await connection.db.collection("maintenance").aggregate(aggToFindRoomsInMaintenanceLastYearPeriodToDate).toArray();
        const dayUseRoomsLastYearPeriodToDate = await connection.db.collection("bookings").aggregate(aggToFinddayUseRoomsLastYearPeriodToDate).toArray();
        const totalOccupiedRoomsLastYearYearToDate = await connection.db.collection("bookings").aggregate(aggToGetTotalOccupiedRoomsLastYearYearToDate).toArray();
        const maintenanceRoomsLastYearYearToDate = await connection.db.collection("maintenance").aggregate(aggToFindRoomsInMaintenanceLastYearYearToDate).toArray();
        const dayUseRoomsLastYearYearToDate = await connection.db.collection("bookings").aggregate(aggToFinddayUseRoomsLastYearYearToDate).toArray();

        const guestActivity = await connection.db.collection("bookings").aggregate(guestActivityAggregation).toArray();
        const statistics = await connection.db.collection("bookings").aggregate(Statistics).toArray();
        const OutOfOrderRoomsvaluetoday = maintenanceRoomsToday.length > 0 ? maintenanceRoomsToday[0]["rooms"] : 0
        const OutOfOrderRoomsvaluePeriodToDate = maintenanceRoomsPeriodToDate.length > 0 ? maintenanceRoomsPeriodToDate[0]["count"] : 0
        const OutOfOrderRoomsyeartodate = maintenanceRoomsYearToDate.length > 0 ? maintenanceRoomsYearToDate[0]["count"] : 0
        const OutOfOrderRoomslastyearToday = maintenanceRoomsLastYearToday.length > 0 ? maintenanceRoomsLastYearToday[0]["count"] : 0
        const OutOfOrderRoomsLastyearPeriodToDate = maintenanceRoomsLastYearPeriodToDate.length > 0 ? maintenanceRoomsLastYearPeriodToDate[0]["count"] : 0
        const OutOfOrderRoomsLastYearYearToDate = maintenanceRoomsLastYearYearToDate.length > 0 ? maintenanceRoomsLastYearYearToDate[0]["count"] : 0

        data = {
            "Revenue": {
                "Today": {
                    "Room Revenue (Net)": getRoomRevenueToday ? getRoomRevenueToday[0]["onedayNetRoomRevenue"] : 0,
                    "Room Revenue (Gross)": getRoomRevenueToday ? getRoomRevenueToday[0]["onedayGrossRroomRevenue"] : 0,
                    "Room Rev.": getRoomRevenueToday ? (getRoomRevenueToday[0]["onedayGrossRroomRevenue"] - getRoomRevenueToday[0]["onedayNetRoomRevenue"]) : 0,
                    "Other Revenue (Net)": 0,
                    "Other Revenue (Gross)": 0,
                    "Other Rev.": 0,
                    "Total Net Revenue": 0,
                    "Total Net Taxes": getRoomRevenueToday ? getRoomRevenueToday[0]["onedayTotalTax"] : 0,
                    "Total Net Adjustments": 0
                },
                "Period To Date": {
                    "Room Revenue (Net)": getRoomRevenuePeriodToDate ? getRoomRevenuePeriodToDate[0]["ptdDayNetRoomRevenue"] : 0,
                    "Room Revenue (Gross)": getRoomRevenuePeriodToDate ? getRoomRevenuePeriodToDate[0]["ptdDayGrossRoomRevenue"] : 0,
                    "Room Rev.": getRoomRevenuePeriodToDate ? getRoomRevenuePeriodToDate[0]["ptdDayGrossRoomRevenue"] - getRoomRevenuePeriodToDate[0]["ptdDayNetRoomRevenue"] : 0,
                    "Other Revenue (Net)": 0,
                    "Other Revenue (Gross)": 0,
                    "Other Rev.": 0,
                    "Total Net Revenue": 0,
                    "Total Net Taxes": getRoomRevenuePeriodToDate ? getRoomRevenuePeriodToDate[0]["ptdTotalTax"] : 0,
                    "Total Net Adjustments": 0
                },
                "Year To Date": {
                    "Room Revenue (Net)": getRoomRevenueYearToDate ? getRoomRevenueYearToDate[0]["roomTotal"] : 0,
                    "Room Revenue (Gross)": getRoomRevenueYearToDate ? getRoomRevenueYearToDate[0]["totalPrice"] : 0,
                    "Room Rev.": getRoomRevenueYearToDate ? getRoomRevenueYearToDate[0]["totalPrice"] - getRoomRevenueYearToDate[0]["roomTotal"] : 0,
                    "Other Revenue (Net)": 0,
                    "Other Revenue (Gross)": 0,
                    "Other Rev.": 0,
                    "Total Net Revenue": 0,
                    "Total Net Taxes": getRoomRevenueYearToDate ? getRoomRevenueYearToDate[0]["totalTax"] : 0,
                    "Total Net Adjustments": 0
                },
                "Last Year Today": {
                    "Room Revenue (Net)": getRoomRevenueLastYearToday.length > 0 ? getRoomRevenueLastYearToday[0]["onedayNetRoomRevenue"] : 0,
                    "Room Revenue (Gross)": getRoomRevenueLastYearToday.length > 0 ? getRoomRevenueLastYearToday[0]["onedayGrossRroomRevenue"] : 0,
                    "Room Rev.": getRoomRevenueLastYearToday.length > 0 ? getRoomRevenueLastYearToday[0]["onedayGrossRroomRevenue"] - getRoomRevenueLastYearToday[0]["onedayNetRoomRevenue"] : 0,
                    "Other Revenue (Net)": 0,
                    "Other Revenue (Gross)": 0,
                    "Other Rev.": 0,
                    "Total Net Revenue": 0,
                    "Total Net Taxes": getRoomRevenueLastYearToday.length > 0 ? getRoomRevenueLastYearToday[0]["onedayTotalTax"] : 0,
                    "Total Net Adjustments": 0
                },
                "Last Year PTD": {
                    "Room Revenue (Net)": getRoomRevenueLastYearPTD.length > 0 ? getRoomRevenueLastYearPTD[0]["ptdDayNetRoomRevenue"] : 0,
                    "Room Revenue (Gross)": getRoomRevenueLastYearPTD.length > 0 ? getRoomRevenueLastYearPTD[0]["ptdDayGrossRoomRevenue"] : 0,
                    "Room Rev.": getRoomRevenueLastYearPTD.length > 0 ? getRoomRevenueLastYearPTD[0]["ptdDayGrossRoomRevenue"] - getRoomRevenueLastYearPTD[0]["ptdDayNetRoomRevenue"] : 0,
                    "Other Revenue (Net)": 0,
                    "Other Revenue (Gross)": 0,
                    "Other Rev.": 0,
                    "Total Net Revenue": 0,
                    "Total Net Taxes": getRoomRevenueLastYearPTD.length > 0 ? getRoomRevenueLastYearPTD[0]["ptdTotalTax"] : 0,
                    "Total Net Adjustments": 0
                },
                "Last Year YTD": {
                    "Room Revenue (Net)": getRoomRevenueLastYTD.length > 0 ? getRoomRevenueLastYTD[0]["roomTotal"] : 0,
                    "Room Revenue (Gross)": getRoomRevenueLastYTD.length > 0 ? getRoomRevenueLastYTD[0]["totalPrice"] : 0,
                    "Room Rev.": getRoomRevenueLastYTD.length > 0 ? getRoomRevenueLastYTD[0]["totalPrice"] - getRoomRevenueLastYTD[0]["roomTotal"] : 0,
                    "Other Revenue (Net)": 0,
                    "Other Revenue (Gross)": 0,
                    "Other Rev.": 0,
                    "Total Net Revenue": 0,
                    "Total Net Taxes": getRoomRevenueLastYTD.length > 0 ? getRoomRevenueLastYTD[0]["totalTax"] : 0,
                    "Total Net Adjustments": 0
                }
            },
            "Payment":{
                "Today":{
                    "Cash":0,
                    "Credit Cards Total": "$1754.71",
                    "Paid Out":"#0.00",
                    "Total Payments":"$1754.71"
                },
                "Period To Date":{
                    "Cash":0,
                    "Credit Cards Total": "$1754.71",
                    "Paid Out":"#0.00",
                    "Total Payments":"$1754.71"
                },
                "Year To Date":{
                    "Cash":0,
                    "Credit Cards Total": "$1754.71",
                    "Paid Out":"#0.00",
                    "Total Payments":"$1754.71"
                },
                "Last Year Today":{
                    "Cash":0,
                    "Credit Cards Total": "$1754.71",
                    "Paid Out":"#0.00",
                    "Total Payments":"$1754.71"
                },
                "Last Year PTD":{
                    "Cash":0,
                    "Credit Cards Total": "$1754.71",
                    "Paid Out":"#0.00",
                    "Total Payments":"$1754.71"
                },
                "Last Year YTD":{
                    "Cash":0,
                    "Credit Cards Total": "$1754.71",
                    "Paid Out":"#0.00",
                    "Total Payments":"$1754.71"
                },
            },
            "Room Inventory": {
                "Today": {
                    "Total Rooms": numberOfRoomsOfEveryType.length > 0 ? numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] : 0,
                    "Total Occupied Rooms": occupiedRoomsToday.length > 0 ? occupiedRoomsToday[0]["noOfRooms"] : 0,
                    "Vacant Rooms": numberOfRoomsOfEveryType.length > 0 ? numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] - occupiedRoomsToday[0]["noOfRooms"] : 0,
                    "Group Rooms": groupRoomsToday.length > 0 ? groupRoomsToday[0]["groupRooms"] : 0,
                    "Out Of Order Rooms": OutOfOrderRoomsvaluetoday,
                    "Day Use Rooms": dayUseRoomsToday.length > 0 ? dayUseRoomsToday[0]["count"] : 0,
                    "Group Rooms Not Picked Up": 0
                },
                "Period To Date": {
                    "Total Rooms": numberOfRoomsOfEveryType.length > 0 ? numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * periodtodays_numberOfDays : 0,
                    "Total Occupied Rooms": totalOccupiedRoomsPeriodToDate.length > 0 ? totalOccupiedRoomsPeriodToDate[0]["occupiedRooms"] : 0,
                    "Vacant Rooms": totalOccupiedRoomsPeriodToDate.length > 0 ? numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * periodtodays_numberOfDays - totalOccupiedRoomsPeriodToDate[0]["occupiedRooms"] : 0,
                    "Group Rooms": totalOccupiedRoomsPeriodToDate.length > 0 ? totalOccupiedRoomsPeriodToDate[0]["groupRooms"] : 0,
                    "Out Of Order Rooms": OutOfOrderRoomsvaluePeriodToDate,
                    "Day Use Rooms": dayUseRoomsPeriodToDate.length > 0 ? dayUseRoomsPeriodToDate[0]["count"] : 0,
                    "Group Rooms Not Picked Up": 0
                },
                "Year To Date": {
                    "Total Rooms": numberOfRoomsOfEveryType.length > 0 ? numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * totalDaysFromFirstDayOfYearToToday : 0,
                    "Total Occupied Rooms": totalOccupiedRoomsYearToDate.length > 0 ? totalOccupiedRoomsYearToDate[0]["occupiedRooms"] : 0,
                    "Vacant Rooms": totalOccupiedRoomsPeriodToDate.length > 0 ? numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * totalDaysFromFirstDayOfYearToToday - totalOccupiedRoomsYearToDate[0]["occupiedRooms"] : 0,
                    "Group Rooms": totalOccupiedRoomsYearToDate.length > 0 ? totalOccupiedRoomsYearToDate[0]["groupRooms"] : 0,
                    "Out Of Order Rooms": OutOfOrderRoomsyeartodategttg,
                    "Day Use Rooms": dayUseRoomsYearToDate.length > 0 ? dayUseRoomsYearToDate[0]["count"] : 0,
                    "Group Rooms Not Picked Up": 0
                },
                "Last Year Today": {
                    "Total Rooms": numberOfRoomsOfEveryType.length > 0 ? numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] : 0,
                    "Total Occupied Rooms": occupiedRoomsLastYearToday.length > 0 ? occupiedRoomsLastYearToday[0]["noOfRooms"] : 0,
                    "Vacant Rooms": occupiedRoomsLastYearToday.length > 0 ? numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] - occupiedRoomsLastYearToday[0]["noOfRooms"] : 0,
                    "Group Rooms": groupRoomslastYearToday.length > 0 ? groupRoomslastYearToday[0]["count"] : 0,
                    "Out Of Order Rooms": OutOfOrderRoomslastyearToday,
                    "Day Use Rooms": dayUseRoomsLastYearToday.length > 0 ? dayUseRoomsLastYearToday[0]["count"] : 0,
                    "Group Rooms Not Picked Up": 0
                },
                "Last Year PTD": {
                    "Total Rooms": numberOfRoomsOfEveryType.length > 0 ? numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * (moment().format("MMM Do") == "Feb 29th" ? 28 : periodtodays_numberOfDays) : 0,
                    "Total Occupied Rooms": totalOccupiedRoomsLastYearPeriodToDate.length > 0 ? totalOccupiedRoomsLastYearPeriodToDate[0]["occupiedRooms"] : 0,
                    "Vacant Rooms": totalOccupiedRoomsLastYearPeriodToDate.length > 0 ? numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * periodtodays_numberOfDays - totalOccupiedRoomsLastYearPeriodToDate[0]["occupiedRooms"] : 0,
                    "Group Rooms": totalOccupiedRoomsLastYearPeriodToDate.length > 0 ? totalOccupiedRoomsLastYearPeriodToDate[0]["groupRooms"] : 0,
                    "Out Of Order Rooms": OutOfOrderRoomsLastyearPeriodToDate,
                    "Day Use Rooms": dayUseRoomsLastYearPeriodToDate.length > 0 ? dayUseRoomsLastYearPeriodToDate[0]["count"] : 0,
                    "Group Rooms Not Picked Up": 0
                },
                "Last Year YTD": {
                    "Total Rooms": numberOfRoomsOfEveryType.length > 0 ? numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * (moment().format("MMM Do") == "Feb 29th" ? totalDaysFromFirstDayOfYearToToday - 1 : totalDaysFromFirstDayOfYearToToday) : 0,
                    "Total Occupied Rooms": totalOccupiedRoomsLastYearYearToDate.length > 0 ? totalOccupiedRoomsLastYearYearToDate[0]["occupiedRooms"] : 0,
                    "Vacant Rooms": totalOccupiedRoomsLastYearYearToDate.length > 0 ? numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * totalDaysFromFirstDayOfYearToToday - totalOccupiedRoomsLastYearYearToDate[0]["occupiedRooms"] : 0,
                    "Group Rooms": totalOccupiedRoomsLastYearYearToDate.length > 0 ? totalOccupiedRoomsLastYearYearToDate[0]["groupRooms"] : 0,
                    "Out Of Order Rooms": OutOfOrderRoomsLastYearYearToDate,
                    "Day Use Rooms": dayUseRoomsLastYearYearToDate.length > 0 ? dayUseRoomsLastYearYearToDate[0]["count"] : 0,
                    "Group Rooms Not Picked Up": 0
                }
            },
            "Guest Activity": {
                "Today": {
                    Arrivals: guestActivity[0].totalArrivalsToday.length > 0 ? guestActivity[0].totalArrivalsToday[0]["TotalArrivalsTodaycount"] : 0,
                    "Walk-In Arrivals": guestActivity[0].totalArrivalsToday.length > 0 ? guestActivity[0].totalArrivalsToday[0]["isWalkInTodayCount"] : 0,
                    "Group Arrivals": guestActivity[0].totalArrivalsToday.length > 0 ? guestActivity[0].totalArrivalsToday[0]["groupArrivalsTodayCount"] : 0,
                    "Departures": guestActivity[0].departuresToday.length > 0 ? guestActivity[0].departuresToday[0]["count"] : 0,
                    "Group departures": guestActivity[0].departuresToday.length > 0 ? guestActivity[0].departuresToday[0]["groupDepartures"] : 0,
                    "No Show": 0,
                    "Average LOS": guestActivity[0].averageLosToday.length > 0 ? guestActivity[0].averageLosToday[0]["avgLos"] : 0,
                    "Guest Count Ad|CO|CU": 0
                },
                "Period To Date": {
                    Arrivals: guestActivity[0].totalArrivalsPeriodToDate.length > 0 ? guestActivity[0].totalArrivalsPeriodToDate[0]["count"] : 0,
                    "Walk-In Arrivals": guestActivity[0].totalArrivalsPeriodToDate.length > 0 ? guestActivity[0].totalArrivalsPeriodToDate[0]["isWalkIn"] : 0,
                    "Group Arrivals": guestActivity[0].totalArrivalsPeriodToDate.length > 0 ? guestActivity[0].totalArrivalsPeriodToDate[0]["groupArrivals"] : 0,
                    "Departures": guestActivity[0].departuresPeriodToDate.length > 0 ? guestActivity[0].departuresPeriodToDate[0]["count"] : 0,
                    "Group departures": guestActivity[0].departuresPeriodToDate.length > 0 ? guestActivity[0].departuresPeriodToDate[0]["groupDepartures"] : 0,
                    "No Show": 0,
                    "Average LOS": guestActivity[0].averageLosPeriodToDate.length > 0 ? guestActivity[0].averageLosPeriodToDate[0]["avgLos"] : 0,
                    "Guest Count Ad|CO|CU": 0
                },
                "Year To Date": {
                    Arrivals: guestActivity[0].totalArrivalsYearToDate.length > 0 ? guestActivity[0].totalArrivalsYearToDate[0]["count"] : 0,
                    "Walk-In Arrivals": guestActivity[0].totalArrivalsYearToDate.length > 0 ? guestActivity[0].totalArrivalsYearToDate[0]["isWalkIn"] : 0,
                    "Group Arrivals": guestActivity[0].totalArrivalsYearToDate.length > 0 ? guestActivity[0].totalArrivalsYearToDate[0]["groupArrivals"] : 0,
                    "Departures": guestActivity[0].departuresYearToDate.length > 0 ? guestActivity[0].departuresYearToDate[0]["count"] : 0,
                    "Group departures": guestActivity[0].departuresYearToDate.length > 0 ? guestActivity[0].departuresYearToDate[0]["groupDepartures"] : 0,
                    "No Show": 0,
                    "Average LOS": guestActivity[0].averageLosYearToDate.length > 0 ? guestActivity[0].averageLosYearToDate[0]["avgLos"] : 0,
                    "Guest Count Ad|CO|CU": 0
                },
                "Last Year Today": {
                    Arrivals: guestActivity[0].totalArrivalsLastYearToday.length > 0 ? guestActivity[0].totalArrivalsLastYearToday[0]["count"] : 0,
                    "Walk-In Arrivals": guestActivity[0].totalArrivalsLastYearToday.length > 0 ? guestActivity[0].totalArrivalsLastYearToday[0]["isWalkIn"] : 0,
                    "Group Arrivals": guestActivity[0].totalArrivalsLastYearToday.length > 0 ? guestActivity[0].totalArrivalsLastYearToday[0]["groupArrivals"] : 0,
                    "Departures": guestActivity[0].departuresYearToDate.length > 0 ? guestActivity[0].departuresYearToDate[0]["count"] : 0,
                    "Group departures": guestActivity[0].departuresLastYearToday.length > 0 ? guestActivity[0].departuresLastYearToday[0]["groupDepartures"] : 0,
                    "No Show": 0,
                    "Average LOS": guestActivity[0].averageLosLastYearToday.length > 0 ? guestActivity[0].averageLosLastYearToday[0]["avgLos"] : 0,
                    "Guest Count Ad|CO|CU": 0
                },
                "Last Year PTD": {
                    Arrivals: guestActivity[0].totalArrivalsLastYearPeriodToDate.length > 0 ? guestActivity[0].totalArrivalsLastYearPeriodToDate[0]["count"] : 0,
                    "Walk-In Arrivals": guestActivity[0].totalArrivalsLastYearPeriodToDate.length > 0 ? guestActivity[0].totalArrivalsLastYearPeriodToDate[0]["isWalkIn"] : 0,
                    "Group Arrivals": guestActivity[0].totalArrivalsLastYearPeriodToDate.length > 0 ? guestActivity[0].totalArrivalsLastYearPeriodToDate[0]["groupArrivals"] : 0,
                    "Departures": guestActivity[0].departuresLastYearPeriodToDate.length > 0 ? guestActivity[0].departuresLastYearPeriodToDate[0]["count"] : 0,
                    "Group departures": guestActivity[0].departuresLastYearPeriodToDate.length > 0 ? guestActivity[0].departuresLastYearPeriodToDate[0]["groupDepartures"] : 0,
                    "No Show": 0,
                    "Average LOS": guestActivity[0].averageLosLastYearPeriodToDate.length > 0 ? guestActivity[0].averageLosLastYearPeriodToDate[0]["avgLos"] : 0,
                    "Guest Count Ad|CO|CU": 0
                },
                "Last Year YTD": {
                    Arrivals: guestActivity[0].totalArrivalsLastYearYearToDate.length > 0 ? guestActivity[0].totalArrivalsLastYearYearToDate[0]["count"] : 0,
                    "Walk-In Arrivals": guestActivity[0].totalArrivalsLastYearYearToDate.length > 0 ? guestActivity[0].totalArrivalsLastYearYearToDate[0]["isWalkIn"] : 0,
                    "Group Arrivals": guestActivity[0].totalArrivalsLastYearYearToDate.length > 0 ? guestActivity[0].totalArrivalsLastYearYearToDate[0]["groupArrivals"] : 0,
                    "Departures": guestActivity[0].departuresLastYearYearToDate.length > 0 ? guestActivity[0].departuresLastYearYearToDate[0]["count"] : 0,
                    "Group departures": guestActivity[0].departuresLastYearYearToDate.length > 0 ? guestActivity[0].departuresLastYearYearToDate[0]["groupDepartures"] : 0,
                    "No Show": 0,
                    "Average LOS": guestActivity[0].averageLosLastYearYearToDate.length > 0 ? guestActivity[0].averageLosLastYearYearToDate[0]["avgLos"] : 0,
                    "Guest Count Ad|CO|CU": 0
                }
            },

            "Statistics": {
                "Today": {
                    "Rooms Sold": statistics[0]["RoomsSoldToday"].length > 0 ? statistics[0]["RoomsSoldToday"][0]["noOfRooms"] : 0,
                    "Occupancy %": numberOfRoomsOfEveryType.length > 0 ? ( statistics[0]["RoomsSoldToday"].length > 0 ? statistics[0]["RoomsSoldToday"][0]["noOfRooms"] : 0 ) / numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * 100 : 0,
                    "Occ (%) without OOO": numberOfRoomsOfEveryType.length > 0 ? ( statistics[0]["RoomsSoldToday"].length > 0 ? statistics[0]["RoomsSoldToday"][0]["noOfRooms"] : 0 ) / (numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] - OutOfOrderRoomsvaluetoday) * 100 : 0,
                    "ADR (Net Room)": statistics[0]["ADR_Net_room_Today"].length > 0 ? statistics[0]["ADR_Net_room_Today"][0]["adr"] : 0,
                    "ADR (Gross Room)": statistics[0]["ADR_Gross_room_Today"].length > 0 ? statistics[0]["ADR_Gross_room_Today"][0]["adr"] : 0,
                    "RevPAR (Net Room)": (statistics[0]["ADR_Net_room_Today"].length > 0 ? statistics[0]["ADR_Net_room_Today"][0]["adr"] : 0) * 
                    (numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldToday"].length > 0 ? statistics[0]["RoomsSoldToday"][0]["noOfRooms"] : 0) / numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * 100 : 0),
                    "RevPAR (Gross Room)": (statistics[0]["ADR_Gross_room_Today"].length > 0 ? statistics[0]["ADR_Gross_room_Today"][0]["adr"] : 0) * (numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldToday"].length > 0 ? statistics[0]["RoomsSoldToday"][0]["noOfRooms"] : 0) / numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * 100 : 0),
                    // "ESOC (% 7)":(numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldToday"].length > 0 ? statistics[0]["RoomsSoldToday"][0]["noOfRooms"] : 0) / numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * 100 : 0) >= 7 ? :0
                    "ESOC (% 7)": 0 ,
                    // "AWR (Net Room)":  (getRoomRevenueToday ? getRoomRevenueToday[0]["onedayNetRoomRevenue"] : 0)/(guestActivity[0].totalArrivalsToday.length > 0 ? guestActivity[0].totalArrivalsToday[0]["isWalkInTodayCount"] : 0),
                    "AWR (Net Room)":  0,
                    "RevPAW (Net Room)":0
                },
                "Period To Date": {
                    "Rooms Sold": statistics[0]["RoomsSoldPeriodToDate"].length > 0 ? statistics[0]["RoomsSoldPeriodToDate"][0]["roomsSold"] : 0,
                    "Occupancy %": numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldPeriodToDate"].length > 0 ? statistics[0]["RoomsSoldPeriodToDate"][0]["roomsSold"] : 0) / (numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * periodtodays_numberOfDays) * 100 : 0,
                    "Occ (%) without OOO": numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldPeriodToDate"].length > 0 ? statistics[0]["RoomsSoldPeriodToDate"][0]["roomsSold"] : 0) / ((numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * periodtodays_numberOfDays) - OutOfOrderRoomsvaluePeriodToDate) * 100 : 0,
                    "ADR (Net Room)": statistics[0]["Adr_Net_room_PeriodToDate"].length > 0 ? statistics[0]["Adr_Net_room_PeriodToDate"][0]["adr"] : 0,
                    "ADR (Gross Room)": statistics[0]["Adr_Gross_room_PeriodToDate"].length > 0 ? statistics[0]["Adr_Gross_room_PeriodToDate"][0]["adr"] : 0,
                    "RevPAR (Net Room)": (statistics[0]["Adr_Net_room_PeriodToDate"].length > 0 ? statistics[0]["Adr_Net_room_PeriodToDate"][0]["adr"] : 0) * (numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldPeriodToDate"].length > 0 ? statistics[0]["RoomsSoldPeriodToDate"][0]["roomsSold"] : 0) / (numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * periodtodays_numberOfDays) * 100 : 0),
                    "RevPAR (Gross Room)": (statistics[0]["Adr_Gross_room_PeriodToDate"].length > 0 ? statistics[0]["Adr_Gross_room_PeriodToDate"][0]["adr"] : 0) * (numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldPeriodToDate"].length > 0 ? statistics[0]["RoomsSoldPeriodToDate"][0]["roomsSold"] : 0) / (numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * periodtodays_numberOfDays) * 100 : 0),
                    "ESOC (% 7)": 0,
                    // "AWR (Net Room)":  (getRoomRevenuePeriodToDate ? getRoomRevenuePeriodToDate[0]["ptdDayNetRoomRevenue"] : 0)/( guestActivity[0].totalArrivalsPeriodToDate.length > 0 ? guestActivity[0].totalArrivalsPeriodToDate[0]["isWalkIn"] : 0),
                    "AWR (Net Room)":  0,
                    "RevPAW (Net Room)":0
                },
                "Year To Date": {
                    "Rooms Sold": statistics[0]["RoomsSoldYearToDate"].length > 0 ? statistics[0]["RoomsSoldYearToDate"][0]["roomsSold"] : 0,
                    "Occupancy %": numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldYearToDate"].length > 0 ? statistics[0]["RoomsSoldYearToDate"][0]["roomsSold"] : 0) / (numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * totalDaysFromFirstDayOfYearToToday) * 100 : 0,
                    "Occ (%) without OOO": numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldYearToDate"].length > 0 ? statistics[0]["RoomsSoldYearToDate"][0]["roomsSold"] : 0) / ((numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * totalDaysFromFirstDayOfYearToToday) - OutOfOrderRoomsyeartodate) * 100 : 0,
                    "ADR (Net Room)": statistics[0]["Adr_Net_room_YearToDate"].length > 0 ? statistics[0]["Adr_Net_room_YearToDate"][0]["adr"] : 0,
                    "ADR (Gross Room)": statistics[0]["Adr_Gross_room_YearToDate"].length > 0 ? statistics[0]["Adr_Gross_room_YearToDate"][0]["adr"] : 0,
                    "RevPAR (Net Room)": (statistics[0]["Adr_Net_room_YearToDate"].length > 0 ? statistics[0]["Adr_Net_room_YearToDate"][0]["adr"] : 0) * (numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldYearToDate"].length > 0 ? statistics[0]["RoomsSoldYearToDate"][0]["roomsSold"] : 0) / (numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * totalDaysFromFirstDayOfYearToToday) * 100 : 0),
                    "RevPAR (Gross Room)": (statistics[0]["Adr_Gross_room_YearToDate"].length > 0 ? statistics[0]["Adr_Gross_room_YearToDate"][0]["adr"] : 0) * (numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldYearToDate"].length > 0 ? statistics[0]["RoomsSoldYearToDate"][0]["roomsSold"] : 0) / (numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * totalDaysFromFirstDayOfYearToToday) * 100 : 0),
                    "ESOC (% 7)": 0 ,
                    "AWR (Net Room)":  0,
                    "RevPAW (Net Room)":0
                },
                "Last Year Today": {
                    "Rooms Sold": statistics[0]["RoomsSoldLastYearToday"].length > 0 ? statistics[0]["RoomsSoldLastYearToday"][0]["noOfRooms"] : 0,
                    "Occupancy %": numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldLastYearToday"].length > 0 ? statistics[0]["RoomsSoldLastYearToday"][0]["noOfRooms"] : 0) / numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * 100 : 0,
                    "Occ (%) without OOO": numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldLastYearToday"].length > 0 ? statistics[0]["RoomsSoldLastYearToday"][0]["noOfRooms"] : 0) / (numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] - OutOfOrderRoomslastyearToday) * 100 : 0,
                    "ADR (Net Room)": statistics[0]["ADR_Net_room_LastYearToday"].length > 0 ? statistics[0]["ADR_Net_room_LastYearToday"][0]["adr"] : 0,
                    "ADR (Gross Room)": statistics[0]["ADR_Gross_room_LastYearToday"].length > 0 ? statistics[0]["ADR_Gross_room_LastYearToday"][0]["adr"] : 0,
                    "RevPAR (Net Room)": (statistics[0]["ADR_Net_room_LastYearToday"].length > 0 ? statistics[0]["ADR_Net_room_LastYearToday"][0]["adr"] : 0) * (numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldLastYearToday"].length > 0 ? statistics[0]["RoomsSoldLastYearToday"][0]["noOfRooms"] : 0) / numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * 100 : 0),
                    "RevPAR (Gross Room)": (statistics[0]["ADR_Gross_room_LastYearToday"].length > 0 ? statistics[0]["ADR_Gross_room_LastYearToday"][0]["adr"] : 0) * (numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldLastYearToday"].length > 0 ? statistics[0]["RoomsSoldLastYearToday"][0]["noOfRooms"] : 0) / numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * 100 : 0),
                    "ESOC (% 7)": 0,
                    "AWR (Net Room)":  0 ,
                    "RevPAW (Net Room)":0

                },
                "Last Year PTD": {
                    "Rooms Sold": statistics[0]["RoomsSoldLastYearPeriodToDate"].length > 0 ? statistics[0]["RoomsSoldLastYearPeriodToDate"][0]["roomsSold"] : 0,
                    "Occupancy %": numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldLastYearPeriodToDate"].length > 0 ? statistics[0]["RoomsSoldLastYearPeriodToDate"][0]["roomsSold"] : 0) / (numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * periodtodays_numberOfDays) * 100 : 0,
                    "Occ (%) without OOO": numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldLastYearPeriodToDate"].length > 0 ? statistics[0]["RoomsSoldLastYearPeriodToDate"][0]["roomsSold"] : 0) / ((numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * periodtodays_numberOfDays) - OutOfOrderRoomsLastyearPeriodToDate) * 100 : 0,
                    "ADR (Net Room)": statistics[0]["Adr_Net_room_LastYearPeriodToDate"].length > 0 ? statistics[0]["Adr_Net_room_LastYearPeriodToDate"][0]["adr"] : 0,
                    "ADR (Gross Room)": statistics[0]["Adr_Gross_room_LastYearPeriodToDate"].length > 0 ? statistics[0]["Adr_Gross_room_LastYearPeriodToDate"][0]["adr"] : 0,
                    "RevPAR (Net Room)": (statistics[0]["Adr_Net_room_LastYearPeriodToDate"].length > 0 ? statistics[0]["Adr_Net_room_LastYearPeriodToDate"][0]["adr"] : 0) * (numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldLastYearPeriodToDate"].length > 0 ? statistics[0]["RoomsSoldLastYearPeriodToDate"][0]["roomsSold"] : 0) / (numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * periodtodays_numberOfDays) * 100 : 0),
                    "RevPAR (Gross Room)": (statistics[0]["Adr_Gross_room_LastYearPeriodToDate"].length > 0 ? statistics[0]["Adr_Gross_room_LastYearPeriodToDate"][0]["adr"] : 0) * (numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldLastYearPeriodToDate"].length > 0 ? statistics[0]["RoomsSoldLastYearPeriodToDate"][0]["roomsSold"] : 0) / (numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * periodtodays_numberOfDays) * 100 : 0),
                    "ESOC (% 7)": 0 ,
                    "AWR (Net Room)":  0,
                    "RevPAW (Net Room)":0

                },
                "Last Year YTD": {
                    "Rooms Sold": statistics[0]["RoomsSoldLastYearYearToDate"].length > 0 ? statistics[0]["RoomsSoldLastYearYearToDate"][0]["roomsSold"] : 0,
                    "Occupancy %": numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldLastYearYearToDate"].length > 0 ? statistics[0]["RoomsSoldLastYearYearToDate"][0]["roomsSold"] : 0) / (numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * totalDaysFromFirstDayOfYearToToday) * 100 : 0,
                    "Occ (%) without OOO": numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldLastYearYearToDate"].length > 0 ? statistics[0]["RoomsSoldLastYearYearToDate"][0]["roomsSold"] : 0) / ((numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * totalDaysFromFirstDayOfYearToToday) - maintenanceRoomsLastYearYearToDate) * 100 : 0,
                    "ADR (Net Room)": statistics[0]["Adr_Net_room_LastYearYearToDate"].length > 0 ? statistics[0]["Adr_Net_room_LastYearYearToDate"][0]["adr"] : 0,
                    "ADR (Gross Room)": statistics[0]["Adr_Gross_room_LastYearYearToDate"].length > 0 ? statistics[0]["Adr_Gross_room_LastYearYearToDate"][0]["adr"] : 0,
                    "RevPAR (Net Room)": (statistics[0]["Adr_Net_room_LastYearYearToDate"].length > 0 ? statistics[0]["Adr_Net_room_LastYearYearToDate"][0]["adr"] : 0) * (numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldLastYearYearToDate"].length > 0 ? statistics[0]["RoomsSoldLastYearYearToDate"][0]["roomsSold"] : 0) / (numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * totalDaysFromFirstDayOfYearToToday) * 100 : 0),
                    "RevPAR (Gross Room)": (statistics[0]["Adr_Gross_room_LastYearYearToDate"].length > 0 ? statistics[0]["Adr_Gross_room_LastYearYearToDate"][0]["adr"] : 0) * (numberOfRoomsOfEveryType.length > 0 ? (statistics[0]["RoomsSoldLastYearYearToDate"].length > 0 ? statistics[0]["RoomsSoldLastYearYearToDate"][0]["roomsSold"] : 0) / (numberOfRoomsOfEveryType[0]["totalRoomsEveryType"] * totalDaysFromFirstDayOfYearToToday) * 100 : 0),
                    "ESOC (% 7)": 0 ,
                    "AWR (Net Room)":  0,
                    "RevPAW (Net Room)":0
                }
            },
            "Forcast": forcast
        }
        // console.log(data, "this is the data")
        await connection.client.close();
    } catch (error) {
        console.log(error)
        status = false;
        data = error.message;
    }
    let response = { status, data };
    return response;
});
