const { dbConnect } = require("../../common/dbConnect")
let status, data
exports.getRoomDetails = async (request) => {
    // console.log('request',request)
    console.log("roomList api is hit")
    const moment = require("moment")
    const propertyKey = request?.propertyKey
    let { startDate, endDate } = request
    try {
        const connection = await dbConnect()
        const query = { propertyKey: propertyKey }

        let dates = []
  
        startDate = startDate.split("-")[2] + '-' + startDate.split("-")[0] + "-" + startDate.split("-")[1]
        endDate = endDate.split("-")[2] + '-' + endDate.split("-")[0] + "-" + endDate.split("-")[1]
        let currentDate = new Date(startDate);
        endDate = new Date(endDate);
        while (currentDate < endDate) {
            dates.push(new Date(currentDate).toISOString().split("T")[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        let users = await connection.db.collection("rooms").find(query).toArray()

        let obj1 = {}
        dates.map(item => {

            // console.log('item',item)
            obj1[item] = 1
        })

        const aggregate1 = ([
            {
                $project: {
                    defaultPrice: 1,
                    roomName: 1,
                    datesPrice: obj1,
                    intervals: 1
                }
            }
        ])

        let result = await connection.db.collection("finalRoomsPrice").aggregate(aggregate1).toArray()

        console.log("%%%%%%%", result)
        let baseRates = {}
        result.map(item => {
            let total = 0
            try {
                if (item.intervals.length > 0) {
                    item["intervals"].map((interval) => {
                        console.log("we are here")
                        let endDate2 = moment(endDate)
                        let startDate2 = moment(startDate)
                        let diff = endDate2.diff(startDate2, 'days')
                        console.log("diff", diff)

                        if (diff >= interval.minLos && diff <= interval.maxLos) {
                            console.log("we are her111")
                            console.log("item",item)
                            try {
                                let startDate1 = interval.startDate

                                let endDate1 = interval.endDate

                              
                                while (startDate1 !== endDate1) {
                                    baseRates[startDate1] =interval[moment(startDate1).format('ddd').toLocaleLowerCase()]
                                    startDate1 = moment(startDate1, "YYYY-MM-DD").add(1, 'days').format('YYYY-MM-DD')
                                }

                                console.log("baseRates", baseRates)
                            } catch (error) { console.log(error) }                          
                        }

                    })
                }
            } catch (err) { console.log(err) }

            dates.map((value) => {
                console.log("vvv",value)
                    console.log("!!!!",baseRates)
                    let defaultPrice = baseRates?.[value] ? baseRates?.[value]:item["defaultPrice"]
                    item["datesPrice"][value] = item["datesPrice"][value] ? item["datesPrice"][value] : defaultPrice
                    total = item["datesPrice"][value] + total
            })
            // console.log('totalPrice',total)
            item["totalPrice"] = total
        })

        users.map(user => {
            result.map(res => {
                if (user["roomName"] === res["roomName"]) {
                    user["totalPrice"] = res["totalPrice"]
                }
            })
        })

        users.length > 0 ? status = true : status = false
        status == true ? data = users : data = users
        await connection.client.close()
    } catch (error) {
        status = false
        data = error
    }
    let response = { status, data }
    return response
}
