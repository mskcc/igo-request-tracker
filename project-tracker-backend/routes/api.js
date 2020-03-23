var express = require("express");
var authRouter = require("./auth");
var limsRouter = require("./projects");

var app = express();


app.use("/auth/", authRouter);
app.use("/projects/", limsRouter);

module.exports = app;
