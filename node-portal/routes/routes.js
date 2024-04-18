const express = require("express");
const bodyParser = require("body-parser");
const { getRoomDetails } = require("../Api/Hotels/RoomList");
const { getPropertiesDetails } = require("../Api/Hotels/PropertiesDetails");
const { getCountries } = require("../Api/Hotels/CountryList");
const { login } = require("../Api/Admin/login");
const { addBookings } = require("../Api/Hotels/Bookings");
const { authBookings } = require("../Api/Hotels/AuthorizeBooking");

const { getAvailableRooms } = require("../Api/Hotels/AvailableRooms");
const { getBookingsByDate } = require("../Api/Admin/getBookingsByDate");
const { getBookingsByMonth } = require("../Api/Admin/getBookingsByMonth");
const { getBookingsQuaterly } = require("../Api/Admin/getBookingQuaterly");
const { saveBookingReports } = require("../Api/Admin/saveGeneratedReport");
const { getSavedReports } = require("../Api/Admin/getSavedReports");
const { getAutomatedReports } = require("../Api/Admin/getAutomatedReports");
const {
  sendMailtoGoingDepartureClients,
} = require("../Api/Admin/sendMailToGoingDepatureClients");
const { getAllProperties } = require("../Api/Admin/getAllProperties");
const { getRoomsType } = require("../Api/Admin/getRoomsType");
const { getRooms } = require("../Api/Admin/getRooms");
const { updateData } = require("../Api/Admin/updateData");
const { getRoomTypeById } = require("../Api/Admin/getRoomTypeById");
const { checkAvailability } = require("../Api/Admin/checkAvailability");
const { createReservation } = require("../Api/Admin/createReservation");
const { getAllBookings } = require("../Api/Admin/getAllBookings");
const {
  findAccommodationByUserId,
} = require("../Api/Admin/findAccommodationByUserId");
const { getUserById } = require("../Api/Admin/getUserById");
const { getRewardsByUserId } = require("../Api/Admin/getRewardsByUserId");
const { getReservationById } = require("../Api/Admin/getReservationById");
const { getReportsById } = require("../Api/Admin/getReportsById");
const { getRoomTypeByRoomId } = require("../Api/Admin/getRoomTypeByRoomId");
const { createMaintenance } = require("../Api/Admin/createMaintenance");
const {
  checkRevenueGrowth14DayMonthly,
} = require("../Api/Admin/checkRevenueGrowth14DaysMonthly");
const { savePlanAndPackages } = require("../Api/Admin/savePlanAndPackages");
const { sendSMSToClient } = require("../Api/Admin/sendSmsToClient");
const { getAllRatesAndPlans } = require("../Api/Admin/getAllRatesAndPlans");
const { deletePlanAndPackage } = require("../Api/Admin/deleteRatesAndPlans");
const {
  getAvailableOccupiedHoldToday,
} = require("../Api/Admin/getAvailableOccupiedHoldToday");
const { dailyfinancialreports } = require("../Api/Admin/dailyfinancialreports");
const { summaryreport } = require("../Api/Admin/summaryreport");
const { monthlytaxreport } = require("../Api/Admin/monthlytaxreport");
const { monthlysalesreport } = require("../Api/Admin/monthlysalesreport");
const {
  getPreviousStayByUserId,
} = require("../Api/Admin/getPreviousStayByUserId");
const { getGuestDetails } = require("../Api/Admin/getGuestDetails");
const { taxReports } = require("../Api/Admin/taxReports");
const { addSchedule } = require("../Api/Admin/addSchedule");
const { getSchedule } = require("../Api/Admin/getSchedule");
const { addEmployee } = require("../Api/Admin/addEmployee");
const { deleteBooking } = require("../Api/Admin/deleteBooking");
const jwt = require("jsonwebtoken");
const {
  getAvailableOccupiedHoldforgivenMonth,
} = require("../Api/Admin/getAvailableOccupiedHoldforgivenMonth");
const { getRevenueData } = require("../Api/Admin/getRevenueData");
const { getEmployeedetails } = require("../Api/Admin/getEmployeedetails");
const { editEmployee } = require("../Api/Admin/editEmployee");
const { sharecsv } = require("../Api/Admin/sharecsv");

const {
  getAllGuestsNotAllowed,
} = require("../Api/Admin/getAllGuestsNotAllowed");
// const { automateSendEmail } = require('../Api/Admin/automateSendEmail');
const { sharecsvSchedule } = require("../Api/Admin/sharecsvSchedule");
const { editcsvSchedule } = require("../Api/Admin/editcsvSchedule");
const { setRoomsPrice } = require("../Api/Admin/setRoomsPrice");
const {
  setRoomsPriceOccupancy,
} = require("../Api/Admin/setRoomsPriceOccupancy");
const { addGuestNotAllowed } = require("../Api/Admin/addGuestNotAllowed");
const { getDnrBookings } = require("../Api/Admin/getDnrBookings");
const { fetch30DaysData } = require("../Api/Admin/fetch30DaysData");
const { getPaymentInfo } = require("../Api/Admin/getPaymentInfo");
const { getBookedRoomsInfo } = require("../Api/Admin/getBookedRoomsInfo");
const { getTodayBookedRooms } = require("../Api/Admin/getTodayBookedRooms");
const { saveInterval } = require("../Api/Admin/saveInterval");
const { getInterval } = require("../Api/Admin/getInterval");
const { editInterval } = require("../Api/Admin/editInterval");
const { updateInterval } = require("../Api/Admin/updateInterval");
const { deleteInterval } = require("../Api/Admin/deleteInterval");


const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Define middleware function to verify token
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    // Token is missing
    return res.status(401).send("Access denied. No token provided.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    // Token is invalid or expired
    return res.status(401).send(error.message);
  }
}

router.get("/room/all", async (req, res) => {
  try {
   
    const data = await getRoomDetails(req.query);
    // console.log("this is the data which is being send by /room/all api",data)
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




router.post("/admin/saveInterval", verifyToken, async (req, res) => {
  
  try {
    const data = await saveInterval(req?.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/admin/updateInterval", verifyToken, async (req, res) => {
  
  try {
    const data = await updateInterval(req?.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/admin/deleteInterval", verifyToken, async (req, res) => {
  
  try {
    const data = await deleteInterval(req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


 
router.get("/admin/getInterval", verifyToken, async (req, res) => {
  try {
    console.log(req.query)
    const data = await getInterval(req.query);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/admin/editInterval", verifyToken, async (req, res) => {
  console.log('heresssss')
  try {
    console.log(req.query)
    const data = await editInterval(req.query);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/addGuestNotAllowed", async (req, res) => {
  try {
  
    const data = await addGuestNotAllowed(req);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/getAllGuestsNotAllowed", async (req, res) => {
  try {
    
    const data = await getAllGuestsNotAllowed();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/properties/all", async (req, res) => {
  try {
    const data = await getPropertiesDetails();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/countries/all", async (req, res) => {
  try {
    const data = await getCountries();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/admin/login", async (req, res) => {
  try {
    const data = await login(req?.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// AUTHORIZE BOOKING

router.post("/authBookings", async (req, res) => {
  
  console.log('this is running authBookingsauthBookings');
  try {
    const data = await authBookings(req?.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


//remaining to be added to swagger
router.post("/admin/sharecsv", async (req, res) => {
  try {
    const data = await sharecsv(req);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/admin/sharecsvSchedule", async (req, res) => {
  try {
    const data = await sharecsvSchedule(req);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/admin/editcsvSchedule", async (req, res) => {
 
  try {
    const data = await editcsvSchedule(req);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//remaining to be added to swagger
router.post("/addBookings", async (req, res) => {
  try {
    const data = await addBookings(req?.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});





//remaining to be added to swagger
router.get("/getAvailableOccupiedHoldToday", async (req, res) => {
  try {
    const data = await getAvailableOccupiedHoldToday(req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//remaining to be added to swagger
router.get("/getAvailableOccupiedHoldforgivenMonth/:id", async (req, res) => {
  try {
    const data = await getAvailableOccupiedHoldforgivenMonth(req.params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/admin/getRevenueData", async (req, res) => {
  try {
    const data = await getRevenueData(req.params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/admin/dailyfinancialreports/", verifyToken, async (req, res) => {
  try {
    const data = await dailyfinancialreports(req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/admin/monthlytaxreport/:id", verifyToken, async (req, res) => {
  try {
    const data = await monthlytaxreport(req.params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/admin/monthlysalesreport/:id", verifyToken, async (req, res) => {
  try {
    const data = await monthlysalesreport(req.params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/admin/summaryreport/:id", verifyToken, async (req, res) => {
  try {
    // console.log("this is run")
    // console.log(req.params)
    const data = await summaryreport(req.params);
    res.json(data);
    // res.send("summaryreport api run")
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/availableRooms/:id", async (req, res) => {
  try {
    const data = await getAvailableRooms(req);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/admin/getBookingsByDate", verifyToken, async (req, res) => {
  try {
    const data = await getBookingsByDate(req);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/admin/getBookingsByMonth", async (req, res) => {
  try {
    const data = await getBookingsByMonth(req?.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/admin/getBookingsQuaterly", verifyToken, async (req, res) => {
  try {
    const data = await getBookingsQuaterly(req?.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// not added to swagger
router.post("/admin/saveBookingReports", verifyToken, async (req, res) => {
  try {
    const data = await saveBookingReports(req?.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//added to swaggerui
router.get("/admin/getSavedReports", verifyToken, async (req, res) => {
  try {
    const data = await getSavedReports();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/admin/getAutomatedReports", verifyToken, async (req, res) => {
  try {
    const data = await getAutomatedReports();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//not added to swagger
router.get("/admin/getReportById", verifyToken, async (req, res) => {
  try {
    const data = await getReportsById(req?.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//not added to swagger
router.get(
  "/admin/sendMailtoGoingDepartureClients",
  verifyToken,
  async (req, res) => {
    try {
      const data = await sendMailtoGoingDepartureClients(req?.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// added to swagger
router.get("/admin/getAllProperties", verifyToken, async (req, res) => {
  try {
    const data = await getAllProperties();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// added to swagger
router.get("/admin/getRoomsType", verifyToken, async (req, res) => {
  try {
    const data = await getRoomsType();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//not added to swagger
router.get("/admin/getRoomsTypeById", verifyToken, async (req, res) => {
  try {
    const data = await getRoomTypeById(req?.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//not added to swagger
router.get("/admin/checkAvailability", verifyToken, async (req, res) => {
  try {
    const data = await checkAvailability(req?.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// added to swagger
router.get("/admin/taxReports", verifyToken, async (req, res) => {
  try {
    const data = await taxReports(req?.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//not added to swagger
router.post("/admin/createReservation", verifyToken, async (req, res) => {
  try {
    const data = await createReservation(req?.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// added to swagger 
router.get("/admin/getAllBookings", verifyToken, async (req, res) => {
  try {
    const data = await getAllBookings(req?.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/admin/getPaymentInfo", verifyToken, async (req, res) => {
  try {
    const data = await getPaymentInfo(req?.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/admin/getBookedRoomsInfo", verifyToken, async (req, res) => {
  try {
    // console.log(req.query);
    // console.log(req.params);
    const data = await getBookedRoomsInfo(req?.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get("/admin/getDnrBookings", verifyToken, async (req, res) => {
  try {
   
    const data = await getDnrBookings(req?.params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// added to swagger
router.delete("/admin/deleteBooking", verifyToken, async (req, res) => {
  // console.log(req,"req")
  try {
    const data = await deleteBooking(req?.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// not added to swagger
router.get("/admin/getAccommodationById", verifyToken, async (req, res) => {
  try {
    const data = await findAccommodationByUserId(req?.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// added to swagger
router.get("/admin/getUserById", verifyToken, async (req, res) => {
  try {
    const data = await getUserById(req?.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// not added to swagger
router.get("/admin/getRewardsByUserId", verifyToken, async (req, res) => {
  try {
    const data = await getRewardsByUserId(req?.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// added to swagger
router.get("/admin/getReservationById", verifyToken, async (req, res) => {
  try {
    const data = await getReservationById(req?.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/admin/getRoomsTypeByTypeId", verifyToken, async (req, res) => {
  try {
    const data = await getRoomTypeByRoomId(req?.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/admin/getRooms", verifyToken, async (req, res) => {
  try {
    const data = await getRooms(req?.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/admin/updateData/:rowId", verifyToken, async (req, res) => {
  try {
    
    const data = await updateData(req?.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// added to swagger
router.post("/admin/createMaintenance", verifyToken, async (req, res) => {
  try {
    const data = await createMaintenance(req?.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// not added to swagger
router.post("/admin/savePlanAndPackages", verifyToken, async (req, res) => {
  try {
    const data = await savePlanAndPackages(req?.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// added to swagger
router.get(
  "/admin/checkRevenueGrowth14DayMonthly",
  verifyToken,
  async (req, res) => {
    try {
      const data = await checkRevenueGrowth14DayMonthly(req?.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// added to swagger
router.get("/admin/getAllRatesAndPlans", async (req, res) => {
  try {
    const data = await getAllRatesAndPlans(req);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// added to swagger
router.get("/admin/getGuestDetails", verifyToken, async (req, res) => {
  try {
    const data = await getGuestDetails(req);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// added to swagger
router.delete("/admin/deletePlanAndPackage", verifyToken, async (req, res) => {
  try {
    const data = await deletePlanAndPackage(req?.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
// not added to swagger
router.post("/admin/createschedule", verifyToken, async (req, res) => {
  try {
    const data = await addSchedule(req);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/admin/getTodayBookedRooms", verifyToken, async(req, res)=>{
  try {
    const data = await getTodayBookedRooms(req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

// not added to swagger
router.post("/admin/addEmployee", verifyToken, async (req, res) => {
  try {
    const data = await addEmployee(req);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/admin/setRoomsPrice", verifyToken, async (req, res) => {
  try {
    const data = await setRoomsPrice(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post("/admin/fetch30DaysData", verifyToken, async (req, res) => {
  try {
    const data = await fetch30DaysData(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post("/admin/setRoomsPriceOccupancy", verifyToken, async (req, res) => {
  try {
    const data = await setRoomsPriceOccupancy(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/admin/getSchedule", verifyToken, async (req, res) => {
  try {
    const data = await getSchedule(req);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/admin/getEmployeedetails", verifyToken, async (req, res) => {
  try {
    const data = await getEmployeedetails(req);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/admin/sendSMSToClient", async (req, res) => {
  try {
    const data = await sendSMSToClient(req?.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get(
  "/admin/reservation/getPreviousStayByUserId",
  verifyToken,
  async (req, res) => {
    try {
      const data = await getPreviousStayByUserId(req?.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// router.post("/admin/automateSendEmail", verifyToken , async (req, res )=>{
//     try {
//         console.log("this is run")
//         const data = await automateSendEmail(req);
//         res.json(data);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// })

router.put("/admin/editEmployee", verifyToken, async (req, res) => {
  try {
    const data = await editEmployee(req);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;