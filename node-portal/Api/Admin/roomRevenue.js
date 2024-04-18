db.bookings.aggregate([
  {
    $match:{
      checkInDate:{$lt:'2023-05-31'},
      checkOutDate:{$gt:'2023-05-01'}
    }
  },{
    $project:{
        noOfRooms:1,
        totalPrice:{$toDouble:"$totalPrice"},
        totalDays:{
            $cond: {
          	if: { $lt:["$checkInDate",'2023-05-01'] },
          	then: {
            		  $dateDiff:{
		                startDate:{"$toDate":'2023-05-01'},
		                endDate:{"$toDate":"$checkOutDate"},
            				unit:"day"
	            	  }
          	      },
	          else: {
            		$cond:{
		               if:{
		                  	$gt:["$checkOutDate",'2023-05-31'] 
            			  },
        		        then: {
			                $dateDiff: {
			                startDate: {"$toDate":"$checkInDate"},
			                endDate: {"$toDate":'2023-05-31'},
			                unit: "day"
			                }
        			      },
       				       else:"$totalDays"
        	          }
              }
          }
        }
        }
    }
  ])