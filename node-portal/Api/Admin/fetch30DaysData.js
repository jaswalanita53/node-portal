
let status, data, message
const { dbConnect } = require("../../common/dbConnect");

exports.fetch30DaysData = async (resp) => {
    console.log(resp,"response")
    const moment = require("moment")

    // console.log(resp.data,"&&&&&&7")
    
    try {
        const connection = await dbConnect()

        let {startDate, endDate, roomType} = resp.data

        let dates = []

        
        for(let date = startDate ; date<=endDate ;  ){
            dates.push(date)
            date = moment(date).add(1,'days').format('YYYY-MM-DD')
        }
  
        let datesPrice = { }
        dates.forEach(date=>  {
            datesPrice[date] = { $ifNull: [`$datesPrice.${date}`, 100] }
         })
         
        const aggregationToFindCost =  
        ([{
            $match:{
            roomName: roomType
        }},
        {
                $project: {
                    datesPrice,
                    roomName:1
                }
              }
        ]) 
        
        let result = await connection.db.collection('finalRoomsPrice').aggregate(aggregationToFindCost).toArray()
        // console.log(result,"result")
        result.length>0 ? status = true : status = false;
        result.length>0 ? data = result : data = []
        
   

    } catch (error) {
        status = false
        message = error.message
    }
    let response = { status, data, message }
    return response;
}