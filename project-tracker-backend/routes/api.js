var express = require("express");
var limsRouter = require("./projects");

var app = express();

app.use("/projects/", limsRouter);

module.exports = app;
