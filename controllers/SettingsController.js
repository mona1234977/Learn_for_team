const Settings = require("../models/SettingsModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
const { constants } = require("../helpers/constants");
mongoose.set("useFindAndModify", false);

function SettingsData(data) {
  this.id = data._id;
	this.name= data.name;
	this.email = data.email;
	this.password = data.password;
  this.sitename = data.sitename;
  this.isDeleted = data.isDeleted
	this.createdAt = data.createdAt;
  this.smtpemail = data.smtpemail;
  this.smtppasword = data.smtppassword
}

exports.createSettings = [
  auth,
  body("name", "name must not be empty.").isLength({ min: 1 }).trim(),
  body("email", "email must not be empty.").isLength({ min: 1 }).trim(),
  body("password", "password must not be empty.").isLength({ min: 1 }).trim(),
  body("sitename", "sitename must not be empty.").isLength({ min: 1 }).trim(),
  body("smtpemail", "smtpemail must not be empty.").isLength({ min: 1 }).trim(),
	body("smtppassword", "smtppassword must not be empty.").isLength({ min: 1 }).trim().custom((value,{req}) => {
    return Settings.findOne({name:req.body.name}, function(err, doc) {
      if(doc) {
        return 'Same name and email exists'
      }
    });
	}),
	sanitizeBody("*").escape(),
  (req,res) => {
    try {
      const errors = validationResult(req);
      const userSettings = new Settings({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        sitename: req.body.sitename,
        smtpemail: req.body.smtpemail,
        isDeleted: false,
        smtppassword: req.body.smtppassword,
        _id: req.params.id
      });
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
      }else {
      userSettings.save(function (err) {
        if (err) { return apiResponse.ErrorResponse(res, err); }
        let settingsdata = new SettingsData(userSettings);
      return apiResponse.successResponseWithData(res,"Settings add Success.", settingsdata);
      });
    }
    } catch (error) {
			return apiResponse.ErrorResponse(res, err);
    }
  }
]
exports.deleteSettings = [
	auth,
	function (req, res) {
		try {
      let user_id = mongoose.Types.ObjectId(req.params.id);
      console.log(user_id, 'in delete api ')
      Settings.findById(user_id,function (err,foundSettings){
        if(err){
          return apiResponse.ErrorResponse(res,err)
        }
        if(foundSettings === null ){
          return apiResponse.notFoundResponse(res,"Settings not exists with this id");
        }else{
          const userSettings = new Settings({
            name: foundSettings.name,
            email: foundSettings.email,
            password: foundSettings.password,
            sitename: foundSettings.sitename,
            smtpemail: foundSettings.smtpemail,
            smtppassword: foundSettings.smtppassword,
            isDeleted: true,
            _id: user_id
          });
          Settings.findByIdAndDelete(user_id, userSettings, {},function (err) {
            if (err) { 
              return apiResponse.ErrorResponse(res, err); 
            }else{
              let settingsdata = new SettingsData(userSettings);
              return apiResponse.successResponseWithData(res,"Settings update Success.", settingsdata);
            }
          })
        }
      })
      
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}
];


exports.getSettings = [
	auth,
	function (req, res) {
		try {
      Settings.find({},"_id name email sitename password smtpemail smtppassword isDeleted").then((sett_ing) => {
        if(sett_ing.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", sett_ing);
        }
        else{
					return apiResponse.successResponseWithData(res, "Operation success", sett_ing);
        }
      })
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

exports.UpdateSettings = [
  auth,
  body("name", "name must not be empty.").isLength({ min: 1 }).trim(),
  body("email", "email must not be empty.").isLength({ min: 1 }).trim(),
  body("password", "password must not be empty.").isLength({ min: 1 }).trim(),
  body("sitename", "sitename must not be empty.").isLength({ min: 1 }).trim(),
  body("smtpemail", "smtpemail must not be empty.").isLength({ min: 1 }).trim(),
  body("smtppassword", "smtppassword must not be empty.").isLength({ min: 1 }).trim().custom((value,{req}) => {
		return Settings.findOne({name: req.body.name}).then(settings => {
			if (settings && settings.name === req.body.name && settings.email === req.body.email) {
        console.log(settings,"settttt")
				return Promise.reject("Settings already exist with this name.");
			}
		});
	}),
	sanitizeBody("*").escape(),
  (req,res) => {
    try {
     const errors = validationResult(req);
     const userSettings = new Settings({
       name: req.body.name,
       email: req.body.email,
       password: req.body.password,
       isDeleted: false,
       sitename: req.body.sitename,
       smtpemail: req.body.smtpemail,
       smtppassword: req.body.smtppassword,
       _id: req.params.id
     });
     if (!errors.isEmpty()) {
       return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
     }else {
        Settings.findById(req.params.id, function (err, foundsettings) {
          if(err){
            return apiResponse.notFoundResponse(res,"Settings not exists with this id");
          }
          if(foundsettings === null){
            return apiResponse.notFoundResponse(res,"Settings not exists with this id");
          }else{
            // Settings.findByIdAndRemove(req.params.id,function (err) {
			// 				if (err) { 
			// 					return apiResponse.ErrorResponse(res, err); 
			// 				}else{
			// 					return apiResponse.successResponse(res,"Settingss delete Success.");
			// 				}
			// 			});
            Settings.findByIdAndUpdate(req.params.id, userSettings, {},function (err) {
              if (err) { 
                return apiResponse.ErrorResponse(res, err); 
              }else{
                let settingsdata = new SettingsData(userSettings);
                return apiResponse.successResponseWithData(res,"Settings update Success.", settingsdata);
                }
              });
            }	
          })
        }
    } catch (error) {
			return apiResponse.ErrorResponse(res, err);
    }
  }
]

exports.DeleteSettings = [
    auth,
    body("name", "name must not be empty.").isLength({ min: 1 }).trim(),
    body("email", "email must not be empty.").isLength({ min: 1 }).trim(),
    body("password", "password must not be empty.").isLength({ min: 1 }).trim(),
    body("sitename", "sitename must not be empty.").isLength({ min: 1 }).trim(),
    body("smtpemail", "smtpemail must not be empty.").isLength({ min: 1 }).trim(),
    body("smtppassword", "smtppassword must not be empty.").isLength({ min: 1 }).trim().custom((value,{req}) => {
          return Settings.findOne({name: req.body.name}).then(settings => {
              if (settings && settings.name === req.body.name && settings.email === req.body.email) {
          console.log(settings,"settttt")
                  return Promise.reject("Settings already exist with this name.");
              }
          });
      }),
      sanitizeBody("*").escape(),
    (req,res) => {
      try {
       // const errors = validationResult(req);
       // const userSettings = new Settings({
        //  name: req.body.name,
        //  email: req.body.email,
        //  password: req.body.password,
        //  isDeleted: false,
        //  sitename: req.body.sitename,
        //  smtpemail: req.body.smtpemail,
        //  smtppassword: req.body.smtppassword,
        //  _id: req.params.id
       // });
       // if (!errors.isEmpty()) {
       //   return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
       // }else {
          Settings.findById(req.params.id, function (err, foundsettings) {
            if(err){
              return apiResponse.notFoundResponse(res,"Settings not exists with this id");
            }
            if(foundsettings === null){
              return apiResponse.notFoundResponse(res,"Settings not exists with this id");
            }else{
              Settings.findByIdAndRemove(req.params.id,function (err) {
                              if (err) { 
                                  return apiResponse.ErrorResponse(res, err); 
                              }else{
                                  return apiResponse.successResponse(res,"Settingss delete Success.");
                              }
                          });
              // Settings.findByIdAndUpdate(req.params.id, userSettings, {},function (err) {
              //   if (err) { 
              //     return apiResponse.ErrorResponse(res, err); 
              //   }else{
              //     let settingsdata = new SettingsData(userSettings);
              //     return apiResponse.successResponseWithData(res,"Settings update Success.", settingsdata);
              //     }
              //   });
              }	
            })
        //  }
      } catch (error) {
              return apiResponse.ErrorResponse(res, err);
      }
    }
  ]
  