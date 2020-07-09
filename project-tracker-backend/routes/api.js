var express = require('express');
var limsRouter = require('./projects');
var feedbackRouter = require('./feedback');

var app = express();

app.use('/projects/', limsRouter);
app.use('/feedback/', feedbackRouter);

module.exports = app;
