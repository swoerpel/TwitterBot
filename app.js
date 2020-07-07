const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const tweet = require('./api/routes/tweet_image');
const generate = require('./api/routes/generate_image');
const generate_composite = require('./api/routes/generate_composite_image');

// for logging requests
app.use(morgan("dev"));

// allows body arguments to be parsed, extended:true == any type can be sent in body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/tweet_image", tweet);
app.use("/generate_image", generate);
app.use("/generate_composite_image", generate_composite);


// if we get to here that means we did not hit a valid route.
app.use((req, res, next) => {
    const error = new Error("Invalid Route.");
    error.status = 404;
    next(error);
});


module.exports = app;