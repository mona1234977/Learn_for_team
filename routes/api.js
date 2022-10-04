var express = require("express");
var authRouter = require("./auth");
 
 var settingsRouter = require('./settings');
 var users = require('./user')
 var message = require('./message')
 var chat = require('./chat')
 
var app = express();


app.use("/auth/", authRouter);
 
 app.use("/settings/", settingsRouter);
 app.use("/users/", users);
 app.use("/message/",message);
app.use("/chat/",chat)
 

module.exports = app;
