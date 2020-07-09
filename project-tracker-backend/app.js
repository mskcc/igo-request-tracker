const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const apiResponse = require('./helpers/apiResponse');
const cors = require('cors');
const { logger } = require('./helpers/winston');

const jwtInCookie = require('jwt-in-cookie');
// TODO - take from a shared location on server
jwtInCookie.configure({ secret: process.env.JWT_SECRET });

// DB connection
const MONGODB_URL = process.env.MONGODB_URL;
const mongoose = require('mongoose');
mongoose
    .connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        //don't show the log when it is test
        if (process.env.NODE_ENV !== 'test') {
            console.log('Connected to %s', MONGODB_URL);
            console.log('App is running ... \n');
            console.log('Press CTRL + C to stop the process. \n');
        } else {
            logger.log('info', `Connected to ${MONGODB_URL}`);
        }
    })
    .catch((err) => {
        logger.log('error', `Failed to connect to Mongo: "${err.message}"`);
        process.exit(1);
    });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//To allow cross-origin requests
app.use(cors());

//Route Prefixes
app.use('/', indexRouter);
app.use('/api/', apiRouter);

// throw 404 if URL not found
app.all('*', function (req, res) {
    return apiResponse.notFoundResponse(res, 'Page not found');
});

app.use((err, req, res) => {
    if (err.name == 'UnauthorizedError') {
        return apiResponse.unauthorizedResponse(res, err.message);
    }
});

module.exports = app;
