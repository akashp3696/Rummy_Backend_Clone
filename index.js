const express = require('express');
const http = require('http');
const cors = require('cors');
const { connectDB } = require('./db/connect');
require('dotenv').config();
const bodyParser = require("body-parser");

const adminRoute = require("./routes/adminRoute")
const userRoute = require("./routes/userRoute")
const paymentRoute = require("./routes/paymentRoute")
const withdrawalRoute = require("./routes/withdrawalRoute");
const allgameRoute = require("./routes/allgameRoute")
const attachWSForPointPracticeGame = require('./practicegameController/pointPracticeGame');
const attachWSforDealPracticeGame = require('./practicegameroute/dealPracticeRoute');
const attachWSforPoolPracticeGame = require('./practicegameroute/poolPracticeRoute');
const app = express();
const port = process.env.PORT || 8080;
const server = http.createServer(app);

// Socket.io setup
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(cors());

app.get("/", (req, res) => {
    res.status(200).json({ message: "Rummy server is running" })
})

app.use("/api/admin", adminRoute)
app.use("/api/user", userRoute)
app.use("/api/payment", paymentRoute)
app.use("/api/withdrawal", withdrawalRoute)
app.use("/api/game", allgameRoute)
app.use("/api/fund", require("./routes/addFundRoute"))
app.use("/api/banner", require("./routes/bannerRoutes"))
app.use("/api/transaction", require("./routes/transactionRoute"))
app.use("/api/setting", require("./routes/gameSettingRoute"))

// Attach Socket.io listeners

const pointPracticeSocket = io.of('/point-practice');
attachWSForPointPracticeGame(pointPracticeSocket);

const dealPracticeSocket = io.of('/deal-practice');
attachWSforDealPracticeGame(dealPracticeSocket);

const poolPracticeSocket = io.of('/pool-practice');
attachWSforPoolPracticeGame(poolPracticeSocket);

connectDB(process.env.MONGO_URI);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


