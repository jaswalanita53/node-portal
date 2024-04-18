const { dbConnect } = require("../../common/dbConnect");
let status, message;
let response;
exports.setRoomsPrice = async (recieved) => {
  try {
    const connection = await dbConnect();

    console.log("recieved",recieved)
    let {
      startDate,
      endDate,
      selectedRoomType,
      selectedPriceType,
      enteredPrice,
    } = recieved.data;

    startDate = new Date(startDate);
    endDate = new Date(endDate);
    // console.log(recieved.data, "data recieved");

    const dates = [];

    // This logic is for getting all dates between two dates  i.e. startdate and enddate
    let result = await connection.db
      .collection("rooms")
      .find({ roomName: selectedRoomType })
      .toArray();

    let newPrice = +result[0]["pricePerNight"];
    newPrice =
      selectedPriceType === "$"
        ? newPrice + enteredPrice
        : newPrice + (newPrice * enteredPrice) / 100;
    let currentDate = startDate;
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate).toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    // so the dates contains all the dates between and including startdate and endDate which we got from the dashboard

    let dataObj = {};
    // let result = await connection.db.collection("raisedRoomsPrice").insertOne(recieved.data)
    // result.insertedId ? status=true:status=false
    dates.forEach((item) => {
      dataObj[item] = newPrice;
    });

    let data = {
      roomName: selectedRoomType,
      datesPrice: dataObj,
    };
    //
    let result2;
    let result1 = await connection.db
      .collection("finalRoomsPrice")
      .findOne({ roomName: selectedRoomType });
      // console.log(result1,"result1")
    // let result1 = await connection.db.collection("finalRoomsPrice").insertOne(data)
    // let dummydata = new Set([...result1.datesPrice,...data.datesPrice])
    let dummy = result1.datesPrice;

    dates.forEach((item) => {
      const existingItemPrice = dummy?.[item];
      const priceIncrease = selectedPriceType === "$" ? enteredPrice : (existingItemPrice * enteredPrice / 100);
      dummy[item] = existingItemPrice ? (existingItemPrice + priceIncrease) : newPrice;
    });
    

    result1    ? (result2 = await connection.db
          .collection("finalRoomsPrice")
          .updateOne(
            { roomName: selectedRoomType },
            { $set: { datesPrice: dummy } }
          ))
      : (result2 = await connection.db
          .collection("finalRoomsPrice")
          .insertOne(data));
   
    result2.acknowledged ? (status = true) : (status = false);
    status
      ? (message = "Price of " + selectedRoomType + " increased by "+ selectedPriceType +" " +enteredPrice + " ")
      : (message = "There is some Error");
    response = { status, message };
  } catch (error) {
    response = { status: false, message: error };
  }
  return response;
};
