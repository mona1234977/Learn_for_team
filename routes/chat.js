var express = require("express");
const chatController = require("../controllers/chatController");
var router = express.Router();


router.post('/createChat',chatController.createChat)
module.exports = router;