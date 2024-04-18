const express = require('express') // const app = require("https-localhost")()
const fs = require('fs');
const cors = require('cors')
const routes = require('./routes/routes')
const app = express()
const port = 3500
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require('./swagger/swagger.json')
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const Stripe = require("stripe");
const stripe = Stripe("sk_test_51NJflIG5EidfS7HUwNoPd0AcXxiBJOoxnSTBpwDnuJMoeTUKgOsEbqAzSBgnt6usncsadymDH0IVRZhFFKxWqgxg00Z1Sgpphx");
// const stripe = Stripe("sk_test_51O0KtMSBP7VNAXBEcbYavgaSBAlJop4Xy528MPNNPrXwM0gOtbkCr9H8CEf7LgS2Xnk8zov0VvpO9wQ4LDmIBp1100NII5qc09");//Rahul test key secret
app.use(cors())
app.use('/api', routes)

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/hi', (req, res) => {
    res.send("hi")
})

async function createToken(){

  const apiLoginId = '3Wz5dG3s';
  const transactionId = uuidv4(); // Generate a unique UUID
  const amount = '10.00'; // Replace with your actual transaction amount
  const timestamp = Math.floor(new Date().getTime() / 1000); // Current Unix timestamp
  
  const concatenatedString = `${apiLoginId}^${transactionId}^${amount}^${timestamp}`;
  
  // Perform HMAC-SHA512 hash using the Transaction Key
  const hash = crypto.createHmac('sha512', '8833Yxsj25TLJDaB').update(concatenatedString).digest('base64');
  
  console.log('SSL Fingerprint:', hash);
  console.log('timestamp:', timestamp);             
}
createToken();

app.post('/create-checkout-session', async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 5000, // Amount in cents
    currency: 'usd',
  });

  // Create a checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // line_items: [
    //   {
    //     price_data: {
    //       currency: 'usd',
    //       product_data: {
    //       name: 'T-shirt',
    //       },
    //       unit_amount: 2000,
    //     },
    //     quantity: 1,
    //   },
    // ],
    payment_intent: paymentIntent.id,
    mode: 'payment',
    success_url: 'http://localhost:4200/bookingsuccessful',
    cancel_url: 'http://localhost:4200/cancel',
  });

  res.json({ id: session.id, client_secret: paymentIntent.client_secret });
});

// const getCardDetails = async () =>{
//   const token = await stripe.tokens.retrieve(
//     'tok_1O1qcHSBP7VNAXBE9r7SPdm7'
//     );

//     console.log(token)
//   }
// getCardDetails();



app.post('/api/getCardDetails',async (req,res)=>{
  try{

    console.log(req.body)
    const token = req.body.token
    const data = await stripe.tokens.retrieve(token);
    // console.log(data)
    res.send({carddata:data})
  }catch(err){
    console.log(err)
    res.send({msg:err})
  }
})
// Define a new route to fetch card details from a token
// const getCardDetails = async (token) => {
//   try {
//     const tokenData = await stripe.tokens.retrieve(token);
//     console.log(tokenData);
//   } catch (error) {
//     console.error('Error retrieving token:', error);
//   }
// }

app.get("/testdata",(req,  res)=>{
  console.log("Hi this is working today");
  res.send("Hi this is working today");
})
app.listen(port, function (req, res) {
  console.log("Server started at port", port);
});