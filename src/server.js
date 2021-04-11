const routes = require("./routes/index");
const express = require("express");
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const dbConnection = mongoose.connection;

dbConnection.once('open', () => {
    console.log("Mongoose running");
});

dbConnection.on("error", (err) => {
    console.log("Mongoose Error!!!", err);
});

const app = express();

const PORT = process.env.PORT;
app.use(express.json());
app.set('trust proxy', true);

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    return next();
  });

app.use("/", routes);

app.listen(PORT, () => {
    console.log("server started");
})
