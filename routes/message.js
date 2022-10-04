var express = require("express");
const messageController = require("../controllers/messageController");
var router = express.Router();


router.post('/postMessage',messageController.postMessage)
router.get('/viewMessage/:chatId',messageController.viewMessage)
router.delete('/deleteMessage/:chatId',messageController.deleteMessage)
module.exports = router;