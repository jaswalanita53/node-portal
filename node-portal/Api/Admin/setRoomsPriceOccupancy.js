const { dbConnect } = require("../../common/dbConnect");
let status, message;
let response;
exports.setRoomsPriceOccupancy = async (recieved) => {
    try{
        const moment = require("moment")
        const connection = await dbConnect();   
        let today = moment().format("YYYY-MM-DD")
        // today is the today's date

        const todayOccupanyAggregation = ([{
            $match:{
                checkInDate: {$lte:today},
                checkOutDate : {$gt:today}
            }
            },{
            $project:{
            noOfRooms:1
            }},{
            $group:{
            _id:null,
            occupiedRooms: {$sum:"$noOfRooms"}
            }}])


        const totalNumbersOfRoomsToday = ([{
            $project:{
            totalNumberOfRooms:1
            }},{
            $group:{
            _id:null,
            totalNumberOfRooms: {$sum:"$totalNumberOfRooms"}
            }}])

            let result  =  await connection.db.collection("bookings").aggregate(todayOccupanyAggregation).toArray();
            // this result[0]["occupiedRooms"] gives the total number of rooms which are booked today   

            let totalrooms  = await connection.db.collection("rooms").aggregate(totalNumbersOfRoomsToday).toArray()
            // this totalrooms[0]["totalNumberOfRooms"] gives the total rooms which are available today and this will be used to calculate occupancy  
            
            let occupancyPercentageToday = result[0]["occupiedRooms"] / totalrooms[0]['totalNumberOfRooms'] *100  

            if(occupancyPercentageToday >= recieved.data.occupancy){
                // finalPrice = 
          

               

            const pricePerNightAggregation = ([{
                $project:{
                pricePerNight:1,
                roomName:1
                }}])

            let pricePerNight = await connection.db.collection("rooms").aggregate(pricePerNightAggregation).toArray();

            pricePerNight.map(async(item)=>{
                let check  =  await connection.db.collection("finalRoomsPrice").find({roomName: item.roomName}).toArray();
                    
                if(check.length>0) {
                    // finalRoomsPrice has this mapped item roomName as key in a document
                    // console.log(check,"cjec")
                    let dummy  = check[0]["datesPrice"]
                    // console.log(dummy)
                    for(let i=1; i<=recieved.data.nextNumberOfDays; i++){
                        let oneday = moment().add(i, 'days').format('YYYY-MM-DD');
                        // this oneday is the nextday, and oneplus nextday and so on, according to the value of  i 
                        dummy[oneday] =  (dummy?.[oneday] ? dummy?.[oneday] : item.pricePerNight ) + 
                        (recieved.data.raisedPriceType === "$" ?  recieved.data.raisedPrice : (recieved.data.raisedPrice * dummy[oneday]/100))
                    }
                    // console.log(dummy)
                    await connection.db.collection("finalRoomsPrice").updateOne({roomName: item.roomName},{$set:{datesPrice:dummy}})
                } 
                else {
                      // finalRoomsPrice does not have this mapped item as key in a document
                    let dummy  = {}
                    for(let i=1; i<=recieved.data.nextNumberOfDays; i++){
                        let oneday = moment().add(i, 'days').format('YYYY-MM-DD');
                        // this oneday is the nextday, and oneplus nextday and so on, according to the value of  i 
                        dummy[oneday] =  item.pricePerNight  + 
                        (recieved.data.raisedPriceType === "$" ?  recieved.data.raisedPrice : (recieved.data.raisedPrice * dummy[oneday]/100))
                    }
                    let data = {
                        roomName: item.roomName,
                        datesPrice:dummy
                    }
                    await connection.db.collection("finalRoomsPrice").insertOne(data)
                }
                status = true
                status? message = "Price increased of each room by " + recieved.data.raisedPriceType + " " + recieved.data.raisedPrice + " for next " +recieved.data.nextNumberOfDays+ " days" :  message = "There is some Error";
            })       
        }
        else {
            status = false
            message = "Provided occupancy is greater than occupancy for today"
        }
        response = {status, message}

    }catch (error) {
        response = { status: false, message: error };
    }
    return response;
}