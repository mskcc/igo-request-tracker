var express = require("express");
var authRouter = require("./auth");
var bookRouter = require("./book");
var limsRouter = require("./projects");

var app = express();


app.use("/auth/", authRouter);
app.use("/book/", bookRouter);
app.use("/projects/", limsRouter);

module.exports = app;
