var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var SettingsSchema = new Schema({
	name: {type: String, required: true},
	email: {type: String, required: true},
	password: {type: String, required: true},
  sitename: {type: String, required: true},
	smtpemail: {type: String, required: true},
	smtppassword: {type: String, required: true},
  isDeleted: {type: String}
}, {timestamps: true});

module.exports = mongoose.model("Settings", SettingsSchema);