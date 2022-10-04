var express = require("express");
var path = require("path");
//var http = require('https');
//const fs = require('fs');
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
var indexRouter = require("./routes/index");
var apiRouter = require("./routes/api");
var apiResponse = require("./helpers/apiResponse");
const { constants } = require("./helpers/constants");
const  utility = require("./helpers/utility");
var cors = require("cors");
var bodyParser = require("body-parser");
var FormData = require('form-data');
var busboy = require('connect-busboy');    
//var http = require('http');
const http2 = require('http2');
var fs = require('fs')
host = 'https://api.sandbox.push.apple.com'

// const options = http2.connect(host, {
// 	key: fs.readFileSync('/etc/letsencrypt/live/ecolive.global/privkey.pem'),
// 	cert: fs.readFileSync('/etc/letsencrypt/live/ecolive.global/fullchain.pem')
//   });

  
// DB connection
var MONGODB_URL = process.env.MONGODB_URL;
var mongoose = require("mongoose");
mongoose.connect(MONGODB_URL, { useNewUrlParser: true,useCreateIndex:true, useUnifiedTopology: true,useFindAndModify:false }).then(() => {
	//don't show the log when it is test
	if(process.env.NODE_ENV !== "test") {
		console.log("Connected to %s", MONGODB_URL);
		console.log("App is running ... \n");
		console.log("Press CTRL + C to stop the process. \n");
	}
})
	.catch(err => {
		console.error("App starting error:", err.message);
		process.exit(1);
	});
var db = mongoose.connection;

	var app = express();
	
	var server = app.listen(3000);
	var io = require('socket.io').listen(server);

	var users = {};
	var allUsers = [];

	io.on('connection', (client) => {
		
		client.on('_online_',function( data, callback ) {
			try { 
				if (data.user_id != "" && data.user_id!== undefined ) {
					allUsers.user_id = 'online';
					client.user_id = data.user_id;
					client.current_user_name = data.current_user_name;
					client.join(data.room_id);
					if(data.user_id in users){
						/**/	
					}else{
						// console.log('room key-online event--',data.room_id)
						users[data.room_key] = client;
					}
				}
				var usernames = [];
			}
			catch (err) 
			{
				console.log("----- Online socket catch *server.js*-----");
			}
		});
		
		client.on( 'message', function(data,callback) {
			try {
				console.log('messsage----------------------------------------------------------');
				console.log('room-key',data.room_key);
				client.broadcast.to(data.room_key).emit( 'message', data);
				var responseData = {
					server_reached: true,
				};
				callback(responseData);
				utility.iphonePushNotification
				// chatSever.sendMessageByPush(data,function(getPendingMessageData){
				// });
				//var msgArr = data.mobileRes;  {"user_id":"6140821c6c51161774aa0405","room_key":"611bb493f069cd4a8a8e27aa","room_id":"611bb493f069cd4a8a8e27aa","message":"Hello test","type":"Hello test","createdAt":"Hello test"}
				console.log("====================== New message ====================== ");
				console.log("New message = ",data);
				console.log("++++++++++++++++++++++ New message ++++++++++++++++++++++ ");
			}
			catch (err) 
			{
				console.log("----- Message socket catch *server.js*-----");
			}
			// sendUnreadMessageMail(data.subject_id,msgArr.gotomsg_id,data.sender_id,data.notification_link);
		});	


		client.on('disconnect', function(data) {	
			try 
			{
				client.broadcast.emit( 'user_disconnected',{user_id:client.user_id});
			}
			catch (err) 
			{
				console.log("----- desconnect socket catch *server.js*-----");
			}
		});

	});


//don't show the log when it is test
if(process.env.NODE_ENV !== "test") {
	app.use(logger("dev"));
}
// app.use(express.urlencoded({extended: true}));
// app.use(express.json()) // To parse the incoming requests with JSON payloads

app.use(express.static(__dirname));
app.use(express.json());
app.use(express.static("uploads"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//To allow cross-origin requests
app.use(express.urlencoded({extended: true})); 
app.use(express.json());
app.use(busboy());
app.use(express.urlencoded({ limit: "50mb", parameterLimit: 500000000 }));

// app.use(express.urlencoded({extended: true})); 
// app.use(express.json());

app.use(cors());
//Route Prefixes

app.use("/", indexRouter);
app.use("/api/", apiRouter);

// throw 404 if URL not found
app.all("*", function(req, res) {
	return apiResponse.notFoundResponse(res, "Page not found");
});

app.use((err, req, res) => {
	if(err.name == "UnauthorizedError"){
		return apiResponse.unauthorizedResponse(res, err.message);
	}
});

app.use(function (err, req, res, next) {
	if (err.name === 'UnauthorizedError') {
		var data = {
			status: 500,
			message: 'invalid token...',
		};
	  return res.status(401).json(data);
	  res.status(401).send('invalid token...');
	}
  });
console.log('App.js-------------')
// listen on port 3000
// app.listen(3000, () => {
//     console.log("Server is listening on port 3000");
// });

module.exports = io;
