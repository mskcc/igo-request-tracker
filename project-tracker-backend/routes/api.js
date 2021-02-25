var express = require("express");
var limsRouter = require("./projects");

var app = express();

app.use("/requests/", limsRouter);

module.exports = app;
