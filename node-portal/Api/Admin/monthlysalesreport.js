const { dbConnect } = require("../../common/dbConnect");
let status, data, message;

exports.monthlysalesreport = async (content) => {
  let provideddate = content.id;
  let year = new Date(provideddate).getFullYear();
  let month = new Date(provideddate).getMonth();
  let firstdateofmonth = new Date(provideddate).setDate(1);
  let lastdateofmonth = new Date(year, month + 1, 1);
  firstdateofmonth = new Date(firstdateofmonth);
  try {
    const connection = await dbConnect();
    let dayofwholemonth = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30,
    ];
    let wholemonthdata = [];

    const calculatedateforaday = async (value, date) => {
      let data = {
        name: +date + 100,
        description: `1807.${date}`,
        _: `50.${date}`,
        percentage: `119.${date}`,
        nights: `4.${date}`,
        room: `108.${date}`,
        other: `0.00`,
        tax: `0.00`,
        total: `0.00`,
        payment: `0.00`,
        balance: `0.00`,
        cancel: `0.00`,
        avgstay: `0.00`,
        adr: `282.${date}`,
        revpar:`300.${date}`
      };
      wholemonthdata.push(data);
    };

    for (
      let date = firstdateofmonth;
      date <= lastdateofmonth;
      date.setDate(date.getDate() + 1)
    ) {
      let datestring = date.toISOString().split("T")[0];
      // console.log(typeof datestring, "here");

      await calculatedateforaday(datestring, date.getDate());
    }

    data = wholemonthdata;
    data ? (status = true) : (status = false);
    status
      ? (message = "monthly sales report has been recieved")
      : (message = "No data recieved!");
  } catch (error) {
    status = false;
    message = error.message;
  }
  let response = { status, data, message };
  return response;
};
