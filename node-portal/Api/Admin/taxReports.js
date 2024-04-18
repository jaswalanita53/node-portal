const { dbConnect } = require("../../common/dbConnect");
let status, data, message;

exports.taxReports = async (content) => {

  try {
    const connection = await dbConnect();


    data = {
      "San Antonio": {
        AMOUNT: "$75.43",
        MTD: "$1302.36",
        "TOTAL REVENUE COLUMN": "$1302.36",
        "TAXABLE REVENUE COLUMN": "$1302.36",
      },
      "Bexar Tax": {
        AMOUNT: "$75.43",
        MTD: "$1302.36",
        "TOTAL REVENUE COLUMN": "$1302.36",
        "TAXABLE REVENUE COLUMN": "$1302.36",
      },
      "Taxes Tax": {
        AMOUNT: "$75.43",
        MTD: "$1302.36",
        "TOTAL REVENUE COLUMN": "$1302.36",
        "TAXABLE REVENUE COLUMN": "$1302.36",
      },
      "Pet Fee Non Refundable": {
        AMOUNT: "$75.43",
        MTD: "$1302.36",
        "TOTAL REVENUE COLUMN": "$1302.36",
        "TAXABLE REVENUE COLUMN": "$1302.36",
      },
      "Damages & Repairs": {
        AMOUNT: "$75.43",
        MTD: "$1302.36",
        "TOTAL REVENUE COLUMN": "$1302.36",
        "TAXABLE REVENUE COLUMN": "$1302.36",
      },
      "Late Fees": {
        AMOUNT: "$75.43",
        MTD: "$1302.36",
        "TOTAL REVENUE COLUMN": "$1302.36",
        "TAXABLE REVENUE COLUMN": "$1302.36",
      },
    };
     data ? (status = true) : (status = false),
     status ? (message = "data has been recieved") : "data not available";
  } catch (error) {
    // console.log(error,"error")
    status = false;
    message = error.message;
  }

  let response = { status, data, message };
  return response;
};
