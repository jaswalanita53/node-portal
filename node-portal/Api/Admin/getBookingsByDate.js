const { dbConnect } = require("../../common/dbConnect")
let status, data;
// console.log('request====>>>>')
exports.getBookingsByDate = async (request) => {
    // console.log('im in backend API')
    // console.log('request',request)


    const currentDate = request?.query?.currentDate
    // console.log('currentDate',currentDate)
    const connection = await dbConnect()
    try {
        const todayaggregation = [
            {
                '$match': {
                    'checkInDate': currentDate
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'userKey',
                    'foreignField': '_id',
                    'as': 'userInfo'
                }
            },
         {
                '$addFields': {
                    'roomKey': {
                        '$map': {
                            'input': '$roomKeys',
                            'as': 'roomInfo',
                            'in': {
                                '$toObjectId': '$$roomInfo.id'
                            }
                        }
                    }
                }
            }, {
                '$lookup': {
                    'from': 'rooms',
                    'localField': 'roomKey',
                    'foreignField': '_id',
                    'as': 'roomsInfo'
                }
            }, {
                '$project': {
                    'roomKey': 0,
                }
            },
            {
                '$unwind': {
                    path: '$userInfo'
                }
            },
        ]


 
        const aggregation2 = [
            {
                '$match': {
                    'checkOutDate': currentDate
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'userKey',
                    'foreignField': '_id',
                    'as': 'userInfo'
                }
            },
            {
                '$addFields': {
                    'roomKey': {
                        '$map': {
                            'input': '$roomKeys',
                            'as': 'roomInfo',
                            'in': {
                                '$toObjectId': '$$roomInfo.id'
                            }
                        }
                    }
                }
            }, {
                '$lookup': {
                    'from': 'rooms',
                    'localField': 'roomKey',
                    'foreignField': '_id',
                    'as': 'roomsInfo'
                }
            }, {
                '$project': {
                    'roomKey': 0
                }
            },
            {
                '$unwind': {
                    path: '$userInfo'
                }
            },
        ]

        const aggregation3 =
            [
                {
                    $match: {
                        checkInDate: { $lte: currentDate },
                        checkOutDate: { $gt: currentDate }
                    }
                },
                {
                    $project: {
                        "noOfRooms": 1,
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


        const aggregation4 = [{
            $project: {
                "totalNumberOfRooms": 1
            }
        }, {
            $group: {
                _id: null,
                "totalRooms": { $sum: "$totalNumberOfRooms" }
            }
        }]
        const stayoversTransientAggr = [
            {
                $match: {
                    totalDays: { $gte: 90 }
                }
            },
            {
                $count: "totalBookings"
            }
        ];
        const stayoversGroupAggr = [
            {
                $match: {
                    noOfRooms: { $gt: 1 }
                }
            },
            {
                $count: "stayoversGroup"
            }
        ]
       
        let todayBookings = await connection.db.collection("bookings").aggregate(todayaggregation).toArray()
        if(todayBookings.length>0){
            console.log('todayBookings++++',todayBookings)
        }
       
        
        let stayoversTransient = await connection.db.collection('bookings').aggregate(stayoversTransientAggr).toArray()
        let stayoversGroup = await connection.db.collection('bookings').aggregate(stayoversGroupAggr).toArray()
        let totalDeparture = await connection.db.collection("bookings").aggregate(aggregation2).toArray()
        let totalOccupancy = await connection.db.collection("bookings").aggregate(aggregation3).toArray()
        //  console.log('todayBookings:', todayBookings);
        let totalRooms = await connection.db.collection("rooms").aggregate(aggregation4).toArray()
        let totalAccommodationBooked = todayBookings.reduce((a, b) => a + b.noOfRooms, 0)
        todayBookings.length > 0 ? status = true : status = false
        data = {
            totalArrivals: todayBookings.length,
            totalDeparture: totalDeparture.length,
            totalAccommodationBooked: totalAccommodationBooked,
            todayBookings: todayBookings,
            totalDepartureDetails: totalDeparture,
            totalOccupancy: totalOccupancy[0]?.roomsBooked ? totalOccupancy[0]?.roomsBooked : 0,
            stayoversTransient: stayoversTransient[0]?.totalBookings ? stayoversTransient[0]?.totalBookings : 0,
            stayoversGroup: stayoversGroup[0]?.stayoversGroup ? stayoversGroup[0]?.stayoversGroup : 0,
            totalRooms: totalRooms[0].totalRooms
        }
        await connection.client.close()
    } catch (error) {
        status = false
        data = error.message   
    }
    let response = { status, data }
    return response;
}