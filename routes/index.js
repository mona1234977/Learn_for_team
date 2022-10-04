var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res) {
	//res.send("this is app")
     console.log('here')
     res.render("index", { title: "Express" });
});

module.exports = router;
