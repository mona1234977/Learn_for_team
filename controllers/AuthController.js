const express = require('express');
const UserModel = require("../models/UserModel");
const { body, validationResult } = require("express-validator");
//const { body } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
var nodemailer = require('nodemailer')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/jwt");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");
const multer = require("multer");
const { CountriesAndNationality } = require("../helpers/utility")

var Email = process.env.EMAIL_SMTP_USERNAME;
var Pass = process.env.EMAIL_SMTP_PASSWORD;
var Host = process.env.EMAIL_SMTP_HOST;
var Port = process.env.EMAIL_465;


exports.uploadSingle = [
	// body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
	// 	.isEmail().withMessage("Email must be a valid email address."),
	// body("email").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				var upload = multer({
					storage: multer.diskStorage({
						destination: function (req, file, cb) {
							cb(null, "./upload");
						},
						filename: function (req, file, cb) {
							cb(null, randomString.generate({ length: 7, charset: 'alphanumeric' }) + path.extname(file.originalname))
						}
					})
				})


			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

// USer Schema
function UserData(data) {
	this._id = data._id;
	this.userName = data.userName;
	this.googleId = data.googleId;
	this.facebookId = data.facebookId;
	this.instagramId = data.instagramId;
	this.profileImage = data.profileImage;
	this.countryCode = data.countryCode;
	this.contactNo = data.contactNo;
	// this.fullContact = data.fullContact;
	this.email = data.email;
	this.createdAt = data.createdAt;
}

/**
 * User registration.
 *
 * @param {string}      firstName
 * @param {string}      lastName
 * @param {string}      userType
 * @param {string}      email
 * @param {string}      password
 * @param {string}      deviceType
 * @param {string}      deviceToken
 * @param {string}      loginType
 *
 * @returns {Object}
 */

exports.register = [
	// Validate fields.
	body("userFullName").isLength({ min: 1 }).trim().withMessage("User name must be specified."),
	body("userType").isLength({ min: 1 }).trim().withMessage("User type must be specified."),
	body("contactNo").isLength({ min: 1 }).trim().withMessage("contactNo must be specified"),
	body("contactCountryCode").isLength({ min: 1 }).trim().withMessage("contactCountrycode is required"),


	body("deviceType").isLength({ min: 1 }).trim().withMessage("deviceType must be specified"),
	body("deviceToken").isLength({ min: 1 }).trim().withMessage("deviceToken must be specified"),
	body("loginType").isLength({ min: 1 }).trim().withMessage("loginType must be specified"),


	// 	.isAlphanumeric().withMessage("Last name has non-alphanumeric characters."),
	// body("deviceType", "Device type must not be empty.").isLength({ min: 1 }).trim(),
	// body("deviceToken", "Device token must not be empty.").isLength({ min: 1 }).trim(),
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address.").custom((value) => {
			return UserModel.findOne({ email: value }).then((user) => {
				if (user) {
					return Promise.reject("E-mail already in use");
				}
			});
		}),

	body("password").isLength({ min: 6 }).trim().withMessage("Password must be 6 characters or greater."),
	// Sanitize fields.


	body("userFullName").escape(),
	body("email").escape(),
	body("contactNo").escape(),
	body("password").escape(),
	body("deviceType").escape(),
	body("deviceToken").escape(),
	body("loginType").escape(),
	// Process request after validation and sanitization.
	(req, res) => {
		try {
			console.log(req.body, 'here =======', req.file)
			// Extract the validation errors from a request.
			const errors = validationResult(req);
			// console.log(errors.Result);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				//hash input password
				bcrypt.hash(req.body.password, 10, function (err, hash) {
					// generate OTP for confirmation
					let otp = utility.randomNumber(4);
					// Create User object with escaped and trimmed data
					//console.log(req.files.drivingLicense[0]?.path,'files======')
					var user = new UserModel(
						{
							userFullName: req.body.userFullName,
							email: req.body.email,
							nationality: "",
							countryOfResidency: "",
							drivingLicense: {
								drivingLicenseFront: "",
								drivingLicenseBack: "",
							},
							passport: {
								passportFront: '',
								passportBack: ''
							},
							voterCard: {
								voterCardFront: '',
								voterCardBack: ''
							},
							insurance: {
								insuranceFront: '',
								insuranceBack: ''
							},
							W8BENDeclaration: false,
							password: hash,
							contactCountryCode: req.body.contactCountryCode,
							contactNo: req.body.contactNo,
							isVerified: false,
							userType: req.body.userType,


							deviceType: req.body.deviceType,
							deviceToken: req.body.deviceToken,
							loginType: req.body.loginType,
							// confirmOTP: otp,
							profileImage: ''

						}
					);
					user.save(function (err) {
						if (err) { return apiResponse.ErrorResponse(res, err); }


						let userData = {
							_id: user._id,
							userFullName: user.userFullName,
							email: user.email,
							UsTaxExemption: user.UsTaxExemption,
							nationality: user.nationality,
							countryOfResidency: user.countryOfResidency,
							// documents: documents,
							// availableDocs: docs,
							documents: false,
							drivingLicense: user.drivingLicense,
							passport: user.passport,
							voterCard: user.voterCard,
							insurance: user.insurance,
							contactCountryCode: req.body.contactCountryCode,
							contactNo: user.contactNo,
							isVerified: user.isVerified,
							wallet: user.wallet,
							W8BENForm: user.W8BENForm,
							W8BENDeclaration: user.W8BENDeclaration,
							userType: user.userType,

							deviceType: user.deviceType,
							deviceToken: user.deviceToken,
							loginType: user.loginType,
							// Actions: user.Actions,
							// otp: otp
						};
						const jwtPayload = userData;
						const jwtData = {
							expiresIn: process.env.JWT_TIMEOUT_DURATION,
						};
						const secret = process.env.JWT_SECRET;
						//Generated JWT token with Payload and secret.
						userData.token = jwt.sign(jwtPayload, secret, jwtData);
						// userData.fullContact = userData.nationality + userData.contactNo;
						return apiResponse.successResponseWithData(res, "Registration Success.", userData);
					});
				});
			}
		} catch (err) {
			//throw error in json response with status 500.
			// console.log(err);
			return apiResponse.ErrorResponse(res, err);
		}
	}];


/**
* User Check.
*
* @param {string}      password
*
* @returns {Object}
*/
exports.checkSecurity = [
	auth,
	body("password").isLength({ min: 1 }).trim().withMessage("Password must be specified."),
	body("password").escape(),
	(req, res) => {
		try {

			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				UserModel.findOne({ _id: req.user._id }).then(user => {
					if (user) {
						console.log('user----------------', user);
						//Compare given password with db's hash.
						bcrypt.compare(req.body.password, user.password, function (err, same) {
							if (same) {
								//Check account confirmation.
								//if(user.isConfirmed){
								// Check User's account active or not.
								if (user.isVerified) {
									let userData = {
										_id: user._id,
										userName: user.userName,
										email: user.email,
										userType: user.userType,
										profileImage: user.profileImage,
										countryCode: user.countryCode,
										contactNo: user.contactNo,
									};
									userData.profileImage = user.profileImage != '' ? constants.urlPath.base + user.profileImage : '';
									// userData.fullContact = user.countryCode + user.contactNo;
									//Generated JWT token with Payload and secret.
									return apiResponse.successResponseWithData(res, "Success.", userData);
								} else {
									return apiResponse.unauthorizedResponse(res, "Account is not active. Please contact admin.");
								}
								// }else{
								// 	return apiResponse.unauthorizedResponse(res, "Account is not confirmed. Please confirm your account.");
								// }
							} else {
								return apiResponse.unauthorizedResponse(res, "Password is wrong.");
							}
						});
					} else {
						return apiResponse.unauthorizedResponse(res, "User id or Password wrong.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * User login.
 *
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
// exports.login = [
// 	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
// 		.isEmail().withMessage("Email must be a valid email address."),
// 	body("password").isLength({ min: 1 }).trim().withMessage("Password must be specified."),
// 	body("email").escape(),
// 	body("password").escape(),
// 	(req, res) => {
// 		try {

// 			const errors = validationResult(req);
// 			if (!errors.isEmpty()) {
// 				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
// 			}else {
// 				UserModel.findOne({email : req.body.email}).then(user => {
// 					if (user) {
// 						console.log('user----------------',user);
// 						//Compare given password with db's hash.
// 						bcrypt.compare(req.body.password,user.password,function (err,same) {
// 							if(same){
// 								//Check account confirmation.
// 								//if(user.isConfirmed){
// 									// Check User's account active or not.
// 									// if(user.userType == 'admin') {
// 										let userData = {
// 											_id: user._id,
// 											userFullName: user.userFullName,
// 											email: user.email,
// 											userType:user.userType,
// 											profileImage: user.profileImage,
// 											nationality: user.nationality,
// 											contactNo: user.contactNo,
// 										};
// 										//Prepare JWT token for authentication
// 										const jwtPayload = userData;
// 										const jwtData = {
// 											expiresIn: process.env.JWT_TIMEOUT_DURATION,
// 										};
// 										const secret = process.env.JWT_SECRET;
// 										userData.profileImage = user.profileImage != '' ? constants.urlPath.base+user.profileImage : '';
// 										userData.fullContact = user.countryCode+user.contactNo;
// 										//Generated JWT token with Payload and secret.
// 										userData.token = jwt.sign(jwtPayload, secret, jwtData);
// 										return apiResponse.successResponseWithData(res,"Login Success.", userData);
// 									// }else {

// 										return apiResponse.unauthorizedResponse(res, "Account is not active. Please contact admin.");
// 									// }
// 								// }else{
// 								// 	return apiResponse.unauthorizedResponse(res, "Account is not confirmed. Please confirm your account.");
// 								// }
// 							}else{
// 								return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
// 							}
// 						});
// 					}else{
// 						return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
// 					}
// 				});
// 			}
// 		} catch (err) {
// 			return apiResponse.ErrorResponse(res, err);
// 		}
// }];

/**
 * User Wallat.
 *
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.getWallet = [
	auth,
	(req, res) => {
		try {
			console.log("joimnsmsm")
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				UserModel.findOne({ _id: req.user._id }).then(user => {
					if (user) {
						let userData = {
							_id: user._id,
							userName: user.userName,
							email: user.email,
							userType: user.userType,
							wallet: user.wallet,
						};
						userData.wallet = userData.wallet != undefined ? userData.wallet : 0;
						return apiResponse.successResponseWithData(res, "Wallet Amount.", userData);
					} else {
						return apiResponse.unauthorizedResponse(res, "Somthing want wrong.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

exports.getWalletByMail = [
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				UserModel.findOne({ email: req.body.email }).then(user => {
					if (user) {
						let userData = {
							_id: user._id,
							userName: user.userName,
							email: user.email,
							userType: user.userType,
							wallet: user.wallet,
						};
						userData.wallet = userData.wallet != undefined ? userData.wallet : 0;
						return apiResponse.successResponseWithData(res, "Wallet Amount.", userData);
					} else {
						return apiResponse.unauthorizedResponse(res, "Somthing want wrong.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

exports.updateProfile = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	body("userName").isLength({ min: 1 }).trim().withMessage("User name must be specified.")
		.isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
	// body("countryCode").isLength({ min: 0 }).trim().withMessage("Country code must be specified.")
	// 	.isNumeric().withMessage("Country code has numeric characters."),
	// body("contactNo").isLength({ min: 0 }).trim().withMessage("Contact no must be specified.")
	// 	.isNumeric().withMessage("Conctact no has numeric characters."),
	body("email").escape(),
	body("firstName").escape(),
	body("lastName").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var user = new UserModel(
				{
					userName: req.body.userName,
					countryCode: req.body.countryCode,
					contactNo: req.body.contactNo,
					contactCountryCode: user.contactCountryCode,
					_id: req.params.id
				}
			);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				UserModel.findByIdAndUpdate(req.params.id, user, {}, function (err, user) {
					if (err) {
						return apiResponse.ErrorResponse(res, err);
					} else {
						let userData = {
							_id: user._id,
							userName: user.userName,
							email: user.email,
							userType: user.userType,
							profileImage: user.profileImage,
							countryCode: user.countryCode,
							contactCountryCode: user.contactCountryCode,
							contactNo: user.contactNo,
							//otp:otp
						};
						// userData.fullContact = user.countryCode + user.contactNo;
						//userData = new UserData(user);
						return apiResponse.successResponseWithData(res, "profile updated Success.", userData);
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * Verify Confirm otp.
 *
 * @param {string}      email
 * @param {string}      otp
 *
 * @returns {Object}
 */
exports.verifyConfirm = [
	// body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
	// 	.isEmail().withMessage("Email must be a valid email address."),
	body("otp").isLength({ min: 1 }).trim().withMessage("OTP must be specified."),
	body("email").escape(),
	body("otp").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				console.log(req.params.id)
				var query = { _id: req.params.id };
				UserModel.findById(query).then(user => {
					if (user) {
						//Check already confirm or not.
						if (!user.isConfirmed) {
							//Check account confirmation.
							if (user.confirmOTP == req.body.otp) {
								//Update user as confirmed
								UserModel.findOneAndUpdate(query, {
									isConfirmed: 1,
									confirmOTP: null
								}).catch(err => {
									return apiResponse.ErrorResponse(res, err);
								});
								return apiResponse.successResponse(res, "Account confirmed success.");
							} else {
								return apiResponse.unauthorizedResponse(res, "Otp does not match");
							}
						} else {
							return apiResponse.unauthorizedResponse(res, "Account already confirmed.");
						}
					} else {
						return apiResponse.unauthorizedResponse(res, "Specified email not found.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * Resend Confirm otp.
 *
 * @param {string}      email
 *
 * @returns {Object}
 */
exports.resendConfirmOtp = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	body("email").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				var query = { email: req.body.email };
				UserModel.findOne(query).then(user => {
					if (user) {
						//Check already confirm or not.
						// Generate otp
						let otp = utility.randomNumber(4);
						// Html email body
						let html = "<p>Please Confirm your Account.</p><p>OTP: " + otp + "</p>";
						// Send confirmation email


						const transporter = nodemailer.createTransport({
							port: 465,               // true for 465, false for other ports
							host: Host,
							auth: {
								user: Email,// specify your email here
								pass: Pass,// specify your password here
							},
							secure: true,
						});

						const mailData = {
							from: Email,  // sender address
							to: req.body.email,   // list of receivers
							subject: 'The OTP FOR Confirm Account',
							// text: 'That was easy!',
							html: "<p>Please Confirm your Account.</p><p>OTP: " + otp + "</p>",
						}

						transporter.sendMail(mailData, function (err, info) {
							if (err) {
								console.log(err)
								return apiResponse.ErrorResponse(res, err)
							}
							else {
								const updat = {
									confirmOTP: otp
								}
								UserModel.findOneAndUpdate({ email: req.body.email }, updat, { new: true }).exec(function (err, usr) {
									if (err) {
										console.log(err)
										return apiResponse.ErrorResponse(res, err)
									} else {
										return apiResponse.successResponseWithData(res, "Sent Otp", otp)
									}
								})
							}
						})
					} else {
						return apiResponse.unauthorizedResponse(res, "Account already confirmed.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

exports.profileByEmail = [
	auth,
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(
					res,
					"Validation Error.",
					errors.array()
				);
			} else {

				UserModel.findOne({ email: req.body.email }).then((user) => {
					//UserModel.findOne({_id: req.user._id }).then((user) => {

					if (user) {
						let userData = {
							_id: user._id,
							userName: user.userName,
							email: user.email,
							loginType: user.loginType,
							// googleId: user.googleId,
							// facebookId: user.facebookId,
							// instagramId: user.instagramId,
							// profileImage: user.profileImage,
							userType: user.userType,
							countryCode: user.countryCode,
							contactCountryCode: user.contactCountryCode,
							contactNo: user.contactNo,
						};
						userData.fullContact = user.countryCode + user.contactNo;
						userData.profileImage = user.profileImage != '' ? constants.urlPath.base + user.profileImage : '';
						return apiResponse.successResponseWithData(
							res,
							"Profile Details Success.",
							userData
						);
					} else {
						return apiResponse.unauthorizedResponse(
							res,
							"User nor found."
						);
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	},
];

exports.profile = [
	auth,
	(req, res) => {
		try {
			console.log('aaaaaaaa');
			console.log(req.user._id);
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(
					res,
					"Validation Error.",
					errors.array()
				);
			} else {

				UserModel.findOne({ _id: req.user._id }).then((user) => {
					//UserModel.findOne({_id: req.user._id }).then((user) => {

					if (user) {
						var count = 0
						const path = constants.urlPath.server_path
						var documents = false


						const retPassport = {
							passportFront: "",
							passportBack: ""
						}
						const retVotercard = {
							voterCardFront: "",
							voterCardBack: ""
						}
						const retDl = {
							drivingLicenseFront: '',
							drivingLicenseBack: ''
						}
						const retInsurance = {
							insuranceFront: '',
							insuranceBack: ''
						}
						if (user.passport.passportFront && user.passport.passportBack) {
							retPassport.passportFront = `${path}${user.passport.passportFront}`
							retPassport.passportBack = `${path}${user.passport.passportBack}`
							count = count + 1
						}
						if (user.voterCard.voterCardFront && user.voterCard.voterCardBack) {
							retVotercard.voterCardFront = `${path}${user.voterCard.voterCardFront}`
							retVotercard.voterCardBack = `${path}${user.voterCard.voterCardBack}`
							count = count + 1
						}
						if (user.drivingLicense.drivingLicenseFront && user.drivingLicense.drivingLicenseBack) {
							retDl.drivingLicenseFront = `${path}${user.drivingLicense.drivingLicenseFront}`
							retDl.drivingLicenseBack = `${path}${user.drivingLicense.drivingLicenseBack}`
							count = count + 1
						}
						if (user.insurance.insuranceFront && user.insurance.insuranceBack) {
							retInsurance.insuranceFront = `${path}${user.insurance.insuranceFront}`
							retInsurance.insuranceBack = `${path}${user.insurance.insuranceBack}`
							count = count + 1
						}
						if(count > 1){
							documents = true
						}

						const returningobj = {
							_id: user._id,
							documents: documents,

							passport: retPassport,
							voterCard: retVotercard,
							drivingLicense: retDl,
							insurance: retInsurance,

							userFullName: user.userFullName,
							nationality: user.nationality,
							countryOfResidency: user.countryOfResidency,
							// availableDocs: docs,
							W8BENDeclaration: user.W8BENDeclaration,
							W8BENForm: user.W8BENForm,
							isVerified: user.isVerified,
							wallet: user.wallet,
							profileImage: user.profileImage && user.profileImage !== '' ? `${path}${ user.profileImage}` : '' ,
							userName: user.userName,
							loginType: user.loginType,
							userType: user.userType,
							deviceType: user.deviceType,
							deviceToken: user.deviceToken,
							email: user.email,
							countryCode: user.countryCode,
							contactCountryCode: user.contactCountryCode,
							isVerified: user.isVerified,
							contactNo: user.contactNo,
							createdAt: user.createdAt
						}

						return apiResponse.successResponseWithData(res, "Profile Details Success.", returningobj);
					} else {
						return apiResponse.unauthorizedResponse(
							res,
							"Somthing want wrong."
						);
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	},
];

exports.updateProfile = [
	auth,
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	body("userName").isLength({ min: 1 }).trim().withMessage("User name must be specified."),

	body("contactCountryCode").isLength({ min: 1 }).trim().withMessage("contactCountrycode is required"),
	body("contactNo").isLength({ min: 0 }).trim().withMessage("Contact No must be specified.")
		.isNumeric().withMessage("Contact No has numeric characters."),
	body("email").escape(),
	body("userName").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			console.log(req.file);

			if (req.file != undefined) {
				// process image here
				var user = new UserModel(
					{
						userName: req.body.userName,
						countryCode: req.body.countryCode,
						contactNo: req.body.contactNo,
						contactCountryCode: user.contactCountryCode,
						profileImage: req.file.path,
						_id: req.params.id
					}
				);
			}
			else {
				var user = new UserModel(
					{
						userName: req.body.userName,
						countryCode: req.body.countryCode,
						contactCountryCode: user.contactCountryCode,
						contactNo: req.body.contactNo,
						_id: req.params.id
					}
				);
			}

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {

				UserModel.findByIdAndUpdate(req.params.id, user, {}, function (err, userRow) {
					if (err) {
						return apiResponse.ErrorResponse(res, err);
					} else {

						let userData = {
							_id: user._id,
							userName: userRow.userName,
							email: userRow.email,
							phoneCode: userRow.phoneCode,
							//otp:otp
						};

						console.log('aaaaa', userData);

						userData = new UserData(userRow);
						userData.userName = req.body.userName;
						userData.userType = userRow.userType,
							userData.googleId = userRow.googleId;
						userData.facebookId = userRow.facebookId;
						userData.instagramId = userRow.instagramId;
						userData.countryCode = req.body.countryCode;
						userData.contactNo = req.body.contactNo;
						// userData.fullContact = req.body.countryCode + req.body.contactNo;
						userData.profileImage = user.profileImage != '' ? constants.urlPath.base + user.profileImage : '';
						return apiResponse.successResponseWithData(res, "profile updated Success.", userData);
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
];


exports.addUpdateShppingAddr = [
	auth,
	// Validate fields.
	body("userName").isLength({ min: 1 }).trim().withMessage("User name must be specified."),
	body("userContact").isLength({ min: 1 }).trim().withMessage("User contact must be specified.")
		.isAlphanumeric().withMessage("Last name has non-alphanumeric characters."),
	body("userPincode", "User pin code must not be empty.").isLength({ min: 1 }).trim(),
	body("userAddresssLine1", "User address 1 must not be empty.").isLength({ min: 1 }).trim(),
	body("city", "City must not be empty.").isLength({ min: 1 }).trim(),
	body("state", "State not be empty.").isLength({ min: 1 }).trim(),
	body("country", "Country must not be empty.").isLength({ min: 1 }).trim(),
	body("addressType", "Address type token must not be empty.").isLength({ min: 1 }).trim(),
	// Sanitize fields.

	body("userName").escape(),
	body("userContact").escape(),
	body("userPincode").escape(),
	body("userAddresssLine1").escape(),
	body("city").escape(),
	body("state").escape(),
	body("country").escape(),
	body("addressType").escape(),
	// Process request after validation and sanitization.
	(req, res) => {
		try {
			console.log('aaaaaaaa');
			console.log(req.user._id);
			// Extract the validation errors from a request.
			const errors = validationResult(req);
			//console.log(errors.Result);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				var userShipping = new UserShippingModel(
					{
						user: req.user._id,
						userName: req.body.userName,
						userContact: req.body.userContact,
						userPincode: req.body.userPincode,
						userAddresssLine1: req.body.userAddresssLine1,
						userAddresssLine2: req.body.userAddresssLine2,
						city: req.body.city,
						state: req.body.state,
						country: req.body.country,
						addressType: req.body.addressType,
						isDefaultAddress: req.body.isDefaultAddress,
					}
				);

				// Create User Shipping object with escaped and trimmed data

				UserShippingModel.find({ user: req.user._id }).then((userShippingDetail) => {

					userShipping._id = req.params.id;

					console.log('user addresss', req.params.id);
					if (userShippingDetail.length > 0 && typeof req.params.id !== 'undefined') {

						UserShippingModel.findByIdAndUpdate(req.params.id, userShipping, { runValidators: false, useFindAndModify: false, new: false }, function (err) {
							if (err) {
								console.log(err)
								return apiResponse.ErrorResponse(res, err);
							} else {
								//	console.log(userShipping)
								//	let userShipping = new ProductData(product);
								return apiResponse.successResponseWithData(res, "Shipping Address Update Success.", userShipping);
							}
						});

					}
					else {
						userShipping.save(function (err) {
							if (err) { return apiResponse.ErrorResponse(res, err); }
							let userData = {
								_id: req.user._id,
								userName: userShipping.userName,
								userContact: userShipping.userContact,
								userPincode: userShipping.userPincode,
								userAddresssLine1: userShipping.userAddresssLine1,
								userAddresssLine2: userShipping.userAddresssLine2,
								city: userShipping.city,
								state: userShipping.state,
								country: userShipping.country,
								addressType: userShipping.addressType,
								isDefaultAddress: userShipping.isDefaultAddress,
							};
							return apiResponse.successResponseWithData(res, "Shipping Address Stor Success.", userData);
						});

					}
				});

			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}];
exports.getUserShipping = [
	auth,
	(req, res) => {

		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {

				//let user_id = mongoose.Types.ObjectId(req.user._id);
				//let shipping_id = mongoose.Types.ObjectId(req.shipping_id);

				console.log('user----------body.shipping_id------', req.body.shipping_id);

				UserShippingModel.find({ user: req.user._id }).then((userShippingDetail) => {
					if (userShippingDetail) {
						// let userData = {
						// 	_id: req.user._id,
						// 	userName: userShipping.userName,
						// 	userContact: userShipping.userContact,
						// 	userPincode: userShipping.userPincode,
						// 	userAddresssLine1: userShipping.userAddresssLine1,
						// 	userAddresssLine2: userShipping.userAddresssLine2,
						// 	city: userShipping.city,
						// 	state: userShipping.state,
						// 	country: userShipping.country,
						// 	addressType: userShipping.addressType,
						// 	isDefaultAddress: userShipping.isDefaultAddress,
						// };
						//Generated JWT token with Payload and secret.
						return apiResponse.successResponseWithData(res, "Shipping Address Success.", userShippingDetail);

					} else {
						return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

exports.testSync = [
	auth,
	(req, res) => {

		try {

			//const errors = validationResult(req);
			var sync_by_user_id = sync_by_user_id = req.user._id;
			var contact_no_json_sting = typeof req.body.contact_no !== 'undefined' ? req.body.contact_no : '';
			var user_country_code = typeof req.body.user_country_code !== 'undefined' ? req.body.user_country_code : '';
			user_country_code = user_country_code.replace(/[|&;$%@"<>()+*#-\s]/g, "");
			//var Array = JSON.parse(JSON.stringify(contact_no_json_sting.toString()));
			const contact_no_json = JSON.parse(contact_no_json_sting);
			console.log('user_country_code', user_country_code);

			if (user_country_code != '' && sync_by_user_id != '' && contact_no_json.length > 0) {

				var contact_obj = [];
				//const promiseInsertContact = new Promise(function(resolve, reject) {
				var user_contacts = [];
				var user_contact_for_query = '';
				var loopcnt = 0;
				var user_contact_arr = [];

				async function waitForContact() {
					for (i = 0; i < contact_no_json.length; i++) {

						var contact_name = contact_no_json[i]['name'];
						var contact_string = contact_no_json[i]['contact'];
						//console.log('sssssssssssss',contact_no_json[i]);
						var contact_string = contact_string.replace(/'/g, '');
						contact_string = contact_string.replace(/[|&;$%@"<>()+*#-\s]/g, "");
						contact_string = contact_string.replace(/^\,+|\,+$/g, '');
						/* Working all garbage remover start*/
						contact_string = contact_string.replace(/^\,+|\,+$/g, '');
						contact_string = contact_string.replace(/[^,0-9 ]/g, "");
						contact_string = contact_string.replace(/,+/g, ',');
						contact_string = contact_string.replace(/^0+/, '');

						/* Working all garbage remover end*/
						if (contact_string != '') {
							//var getRes = await genera_function.checkContactNoNew('+'+contact_string);
							console.log('lib_rrrrrrrrrrrrr', contact_string);
							try {
								var getRes = await genera_function.checkContactNoNew('+' + contact_string);
								if (getRes == true) {
									//contact_string = contact_string;
									var cantact_append = contact_string;
									contact_obj.push(cantact_append);
									user_contact_arr[cantact_append] = contact_name;
									loopcnt = loopcnt + 1;
								}
								else if (getRes == false) {
									//contact_string = user_country_code+contact_string;
									//console.log('false by lib',getRes);
									var cantact_append = user_country_code + contact_string;
									contact_obj.push(cantact_append);
									user_contact_arr[cantact_append] = contact_name;
									loopcnt = loopcnt + 1;
								}
							}
							catch (err) {
								//contact_string = user_country_code+contact_string;
								var cantact_append = user_country_code + contact_string;
								contact_obj.push(cantact_append);
								user_contact_arr[cantact_append] = contact_name;
								loopcnt = loopcnt + 1;
								// error handling
							}
						}
						else {
							loopcnt = loopcnt + 1;
						}
						if (contact_no_json.length == loopcnt) {
							//console.log('iiiiiiii',contact_no_json.length ,'==', loopcnt);

							//var contact_no = contact_obj.join(",");
							/****************** * Select contact of sync check Start ****************/
							//var contact_obj = ["1234567890", "1234567891", "1234567892"],
							regex = contact_obj.join("|");
							console.log("contact_obj------------", contact_obj);
							const user_qry = [
								{
									$addFields: {
										contactFilter: {
											$concat: ["$countryCode", "", "$contactNo"],
										}
									},
								},
								{
									$match: {
										contactFilter: {
											$regex: regex,
											$options: "i",
										},
									},
								},
								{
									$project: {
										userName: 1,
										countryCode: 1,
										contactNo: 1,
										email: 1,
										contactNoWithCode: {
											$concat:
												[
													{ $ifNull: ["$countryCode", ""] },
													{ $ifNull: ["$contactNo", ""] }
												]
										},
										profileImage: {
											$concat:
												[
													{ $cond: [{ $eq: [{ $ifNull: ["$profileImage", ""] }, ""] }, "", constants.urlPath.base] },
													{ $ifNull: ["$profileImage", ""] }
												]
										},
									}
								},
								{ '$sort': { 'createdAt': -1 } },
								{ $facet: { payload: [{ $skip: 0 }, { $limit: 100 }] } }
							]

							UserModel.aggregate(user_qry).exec((err, result) => {
								if (err) {
									return apiResponse.ErrorResponse(res, err);
								}
								if (result) {

									//console.log("result============",result[0].payload)
									var i;
									var returnSync = [];
									var sync_contact_data = [];
									var userReslut = result[0].payload;

									if (userReslut) {
										for (i = 0; i < userReslut.length; i++) {

											var userid = userReslut[i]._id;
											var userName = userReslut[i].userName;
											var countryCode = userReslut[i].countryCode;
											var contactNo = userReslut[i].contactNo;
											var contactNoWithCode = userReslut[i].contactNoWithCode;
											var contactEmail = userReslut[i].email;
											var profileImage = userReslut[i].profileImage;
											//var profileStatus = rows[i].profileStatus == '' ? funclib.getConst('HELLO_I_AM_USING_CAHTTING_APP', lid) : rows[i].profileStatus;
											// var profile_photo_privacy = rows[i].profile_photo_privacy == null ? 'e' : rows[i].profile_photo_privacy;
											// var last_seen_privacy = rows[i].last_seen_privacy == null ? 'e' : rows[i].last_seen_privacy;
											// var status_privacy = rows[i].status_privacy == null ? 'e' : rows[i].status_privacy;
											// if(userimg != null)
											// 
											//}
											returnSync[i] = ({
												"userId": userid,
												"userName": userName,
												"contactNoWithCode": contactNoWithCode,
												"countryCode": countryCode,
												"contactNo": contactNo,
												"contactEmail": contactEmail,
												"profileImage": profileImage,
												// "profileStatus": profileStatus,
												// "profile_photo_privacy": profile_photo_privacy,
												// "last_seen_privacy": last_seen_privacy,
												// "status_privacy": status_privacy

											});
											sync_contact_data[i] = { "user": sync_by_user_id, "userContactId": userid, "userName": userName, "userCountryCode": countryCode, "userCountact": contactNo, "userCountactWithCode": contactNoWithCode };

											//sync_contact_data[i] = [sync_by_user_id, userid, user_contact_arr[contactNoWithCode], countryCode, contactNo, contactNoWithCode];
											//console.log("returnSync= insert=======",sync_contact_data);
										}


										UserContactSyncModel.remove({ user: sync_by_user_id }, function (err) {
											if (err) {
												return apiResponse.ErrorResponse(res, err);
											} else {

												UserContactSyncModel.insertMany(sync_contact_data, function (err, docs) {
													if (err) { return apiResponse.ErrorResponse(res, err); }
													else {
														return apiResponse.successResponseWithData(res, "Contact sync Success.", returnSync);

													}
												});
												// Insert sync data done
												// return response should be here
											}
										});

									} // Contact find or not query
									else {
										return apiResponse.ErrorResponse(res, "No result found.");
									}
									//return apiResponse.ErrorResponse(res, err);
									//console.log(result);
									//	return apiResponse.ErrorResponse(res,"No result found.");

								}
							});
							/****************** * Select contact of sync check End ****************/
						}
					}

				}
				waitForContact();
			}
			else {
				return apiResponse.ErrorResponse(res, "Invalide argument");
			}

		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/****************************** |Sync contact  Api Start| ***************************/
exports.sync_contact_new = async function (req, res) {
	console.log('---------------sync contact-----------Setp 1-------Time--', req.body.user_id);
	try {
		console.log('---------------sync contact-----------try-------Time--', funclib.getCurrentDateTimeUTC());
		var lid = typeof req.body.lang_id !== 'undefined' ? '_' + req.body.lang_id : '';

		var contact_no_json_sting = typeof req.body.contact_no !== 'undefined' ? req.body.contact_no : '';
		var user_country_code = typeof req.body.user_country_code !== 'undefined' ? req.body.user_country_code : '';
		var sync_by_user_id = typeof req.body.userid !== 'undefined' ? req.body.userid : '';
		//return false;
		const contact_no_json = JSON.parse(contact_no_json_sting);
		console.log(contact_no_json);
		var user_id = typeof req.body.user_id !== 'undefined' ? req.body.user_id : '';

		console.log(contact_no_json);

		//console.log(contact_no_json);
		if (user_country_code != '' && sync_by_user_id != '' && contact_no_json.length > 0) {

			var contact_obj = [];
			//const promiseInsertContact = new Promise(function(resolve, reject) {
			var user_contacts = [];
			var user_contact_for_query = '';
			var loopcnt = 0;
			var user_contact_arr = [];
			async function waitForContact() {
				for (i = 0; i < contact_no_json.length; i++) {

					var contact_name = contact_no_json[i]['name'];
					var contact_string = contact_no_json[i]['contact'];
					//console.log('sssssssssssss',contact_no_json[i]);
					var contact_string = contact_string.replace(/'/g, '');
					contact_string = contact_string.replace(/[|&;$%@"<>()+*#-\s]/g, "");
					contact_string = contact_string.replace(/^\,+|\,+$/g, '');
					/* Working all garbage remover start*/
					contact_string = contact_string.replace(/^\,+|\,+$/g, '');
					contact_string = contact_string.replace(/[^,0-9 ]/g, "");
					contact_string = contact_string.replace(/,+/g, ',');
					contact_string = contact_string.replace(/^0+/, '');

					if (contact_string != '') {
						//var getRes = await genera_function.checkContactNoNew('+'+contact_string);
						//console.log('lib_rrrrrrrrrrrrr',getRes);
						try {
							var getRes = await utility.checkContactNoNew('+' + contact_string);
							if (getRes == true) {
								//contact_string = contact_string;
								var cantact_append = contact_string;
								contact_obj.push(cantact_append);
								user_contact_arr[cantact_append] = contact_name;
								loopcnt = loopcnt + 1;
							}
							else if (getRes == false) {
								//contact_string = user_country_code+contact_string;
								//console.log('false by lib',getRes);
								var cantact_append = user_country_code + contact_string;
								contact_obj.push(cantact_append);
								user_contact_arr[cantact_append] = contact_name;
								loopcnt = loopcnt + 1;
							}
						}
						catch (err) {
							//contact_string = user_country_code+contact_string;
							var cantact_append = user_country_code + contact_string;
							contact_obj.push(cantact_append);
							user_contact_arr[cantact_append] = contact_name;
							loopcnt = loopcnt + 1;
							// error handling
						}
					}
					else {
						loopcnt = loopcnt + 1;
					}

					// UserModel.find({
					// 	"CONCAT(u.country_code,u.contact_no))": {"$in": [' + contact_no + ']) }
					//   },"_id user name description image createdAt").then((categories)=>{
					// 	if(categories.length > 0){

					// 		return apiResponse.successResponseWithData(res, "Operation success", categories);
					// 	}else{
					// 		return apiResponse.successResponseWithData(res, "Operation success", []);
					// 	}
					// });




					//user_contact_for_query += contact_string,",";
					//for (j = 0; j < contact_string.length; j++) {
					// user_contacts[i] = [user_id,+contact_string,funclib.getCurrentDateTimeUTC()];
					//}

				}

			}
			//waitForContact();
			// console.log('iiiiiiii',();


			//});

		}
		else {
			res.json({ 'status': true, 'message': funclib.getConst('INVALID_ARGUMENT_IS_MISSING', lid) });
		}
	} //try end
	catch (err) {
		console.log('---------------sync contact-----------try-------Time--', funclib.getCurrentDateTimeUTC());
		console.log("***sync_contact_new*** cath part chat_serverside page----");
	}
}

//fetch all users data for user table

exports.allusers = async (req, res) => {
	try {
		const doc = UserModel.find({})
		const newArray = []
		UserModel.find({}, function (err, doc) {
			if (err) {
				return apiResponse.ErrorResponse(res, err)
			} else {
				//console.log(doc,'doc')
				doc.map((item) => {
					//console.log(item,'item==========')
					if (item.userType == 'user') {
						//console.log(item,'item==========')
						newArray.push(item)
					}
				})

				return apiResponse.successResponseWithData(res, "Userslist", newArray)
			}
		})
	} catch (err) {
		console.log(err)
		return apiResponse.ErrorResponse(res, err);
	}
};

// Update user status (status :true for activate user account, false for deactivate)

exports.UpdateUser = [
	auth,
	body("*").escape(),
	(req, res) => {
		try {

			console.log(req.body, "in update 123")
			console.log(req.params.id, "param id ")
			const update = { isVerified: req.body.isVerified }
			UserModel.findById(req.params.id, function (err, foundUser) {
				if (err) {
					return apiResponse.notFoundResponse(res, "User not exists with this id");
				}
				if (foundUser === null) {
					return apiResponse.notFoundResponse(res, "User not exists with this id");
				} else {
					UserModel.findByIdAndUpdate(req.params.id, update, { new: true }, function (err, updatedUser) {
						if (err) {
							return apiResponse.ErrorResponse(res, err);
						} else {
							return apiResponse.successResponseWithData(res, "User update Success.", updatedUser);
						}
					});
				}
			})
		} catch (error) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
]

// Approve/Disapprove user profile (Approval:true for approving user acc false for disapprove)

exports.ApproveUser = [
	auth,
	body("*").escape(),
	(req, res) => {
		try {

			console.log(req.body, "in update APPROVAL 123")
			console.log(req.params.id, "param id ")
			const update = { Approval: req.body.Approval }
			console.log(update, "UPDATED++++")
			UserModel.findById(req.params.id, function (err, foundUser) {
				if (err) {
					return apiResponse.notFoundResponse(res, "User not exists with this id");
				}
				if (foundUser === null) {
					return apiResponse.notFoundResponse(res, "User not exists with this id");
				} else {
					UserModel.findByIdAndUpdate(req.params.id, update, { new: true }, function (err, updatedUser) {
						if (err) {
							return apiResponse.ErrorResponse(res, err);
						} else {
							return apiResponse.successResponseWithData(res, "User update Success.", updatedUser);
						}
					});
				}
			})
		} catch (error) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
]




exports.adminlogin = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	body("password").isLength({ min: 6 }).trim().withMessage("Password must be 6 characters."),
	body("email").escape(),
	body("password").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				UserModel.findOne({ email: req.body.email }).then(user => {
					if (user) {
						console.log('user----------------', user);
						//Compare given password with db's hash.
						bcrypt.compare(req.body.password, user.password, function (err, same) {
							if (same) {
								//Check account confirmation.
								//if(user.isConfirmed){
								// Check User's account active or not.
								if (user.userType == 'admin') {
									let userData = {
										_id: user._id,
										userFullName: user.userFullName,
										email: user.email,
										userType: user.userType,
										profileImage: user.profileImage,
										nationality: user.nationality,
										contactNo: user.contactNo,
									};
									//Prepare JWT token for authentication
									const jwtPayload = userData;
									const jwtData = {
										expiresIn: process.env.JWT_TIMEOUT_DURATION,
									};
									const secret = process.env.JWT_SECRET;
									userData.profileImage = user.profileImage != '' ? constants.urlPath.base + user.profileImage : '';
									// userData.fullContact = user.countryCode + user.contactNo;
									//Generated JWT token with Payload and secret.
									userData.token = jwt.sign(jwtPayload, secret, jwtData);
									return apiResponse.successResponseWithData(res, "Login Success.", userData);
								} else {
									return apiResponse.unauthorizedResponse(res, "Account is not active. Please contact admin.");
								}
								// }else{
								// 	return apiResponse.unauthorizedResponse(res, "Account is not confirmed. Please confirm your account.");
								// }
							} else {
								return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
							}
						});
					} else {
						return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

exports.updateDocuments = [
	(req, res) => {

		try {
			var missingErr = []

			if ((req.files.passportFront && !req.files.passportBack) || (!req.files.passportFront && req.files.passportBack)) {
				missingErr.push("passport")
			}
			if ((req.files.drivingLicenseFront && !req.files.drivingLicenseBack) || (!req.files.drivingLicenseFront && req.files.drivingLicenseBack)) {
				missingErr.push(" drivinglicense")
			}
			if ((req.files.voterCardFront && !req.files.voterCardBack) || (!req.files.voterCardFront && req.files.voterCardBack)) {
				missingErr.push("VoterCard")
			}
			if ((req.files.insuranceFront && !req.files.insuranceBack) || (!req.files.insuranceFront && req.files.insuranceBack)) {
				missingErr.push("Insurance")
			}
			


			if (missingErr.length !== 0) {
				return apiResponse.ErrorResponse(res, `Both fields are requireed for ${[...missingErr]}`)
			}

	

			var count = 0
			var p = false
			var dl = false
			var vc = false
			var inc = false

			if (req.files.passportFront && req.files.passportBack) {
				p = true
			}
			if (req.files.drivingLicenseFront && req.files.drivingLicenseBack) {
				dl = true
			}
			if (req.files.voterCardFront && req.files.voterCardBack) {
				vc = true
			}
			if (req.files.insuranceFront && req.files.insuranceBack) {
				inc = true
			}

			if (p === true) {
				count = count + 1
			}

			if (dl === true) {
				count = count + 1
			}

			if (vc === true) {
				count = count + 1
			}

			if (inc === true) {
				count = count + 1
			}
			if (count < 2) {
				return apiResponse.ErrorResponse(res, "At least two documents are required")
			}

			const updat = {
				passport: {
					passportFront: ((req.files.passportFront && req.files.passportFront[0].path !== '') ? req.files.passportFront[0].path : ''),
					passportBack: ((req.files.passportBack && req.files.passportBack[0].path !== '') ? req.files.passportBack[0].path : ''),
				},
				drivingLicense: {
					drivingLicenseFront: ((req.files.drivingLicenseFront && req.files.drivingLicenseFront[0].path !== '') ? req.files.drivingLicenseFront[0].path : ''),
					drivingLicenseBack: ((req.files.drivingLicenseBack && req.files.drivingLicenseBack[0].path !== '') ? req.files.drivingLicenseBack[0].path : '')
				},
				voterCard: {
					voterCardFront: ((req.files.voterCardFront && req.files.voterCardFront[0].path !== '') ? req.files.voterCardFront[0].path : ''),
					voterCardBack: ((req.files.voterCardBack && req.files.voterCardBack[0].path !== '') ? req.files.voterCardBack[0].path : '')
				},
				insurance: {
					insuranceFront: ((req.files.insuranceFront && req.files.insuranceFront[0].path !== '') ? req.files.insuranceFront[0].path : ''),
					insuranceBack: ((req.files.insuranceBack && req.files.insuranceBack[0].path !== '') ? req.files.insuranceBack[0].path : '')
				}
			}
			console.log(updat)
			const path = constants.urlPath.server_path

			UserModel.findOneAndUpdate({ _id: req.params.id }, updat, { new: true }).exec(function (err, usr) {
				if (err) {
					console.log(err)
					return apiResponse.ErrorResponse(res, err)
				}
				if(!usr){
					return apiResponse.ErrorResponse(res,"Could not find the user")
				}
				if(usr) {
					var count = 0
					var documents = false



					
					const retPassport = {
						passportFront: "",
						passportBack: ""
					}
					const retVotercard = {
						voterCardFront: "",
						voterCardBack: ""
					}
					const retDl = {
						drivingLicenseFront: '',
						drivingLicenseBack: ''
					}
					const retInsurance = {
						insuranceFront: '',
						insuranceBack: ''
					}
					if (usr.passport.passportFront && usr.passport.passportBack) {
						retPassport.passportFront = `${path}${usr.passport.passportFront}`
						retPassport.passportBack = `${path}${usr.passport.passportBack}`
						count = count + 1
					}
					if (usr.voterCard.voterCardFront && usr.voterCard.voterCardBack) {
						retVotercard.voterCardFront = `${path}${usr.voterCard.voterCardFront}`
						retVotercard.voterCardBack = `${path}${usr.voterCard.voterCardBack}`
						count = count + 1
					}
					if (usr.drivingLicense.drivingLicenseFront && usr.drivingLicense.drivingLicenseBack) {
						retDl.drivingLicenseFront = `${path}${usr.drivingLicense.drivingLicenseFront}`
						retDl.drivingLicenseBack = `${path}${usr.drivingLicense.drivingLicenseBack}`
						count = count + 1
					}
					if (usr.insurance.insuranceFront && usr.insurance.insuranceBack) {
						retInsurance.insuranceFront = `${path}${usr.insurance.insuranceFront}`
						retInsurance.insuranceBack = `${path}${usr.insurance.insuranceBack}`
						count = count + 1
					}

					if(count > 1){
						documents= true
					}

					const returningobj = {
						_id: usr._id,
						documents: documents,
						nationality: usr.nationality,
						countryOfResidency: usr.countryOfResidency,
						W8BENDeclaration: usr.W8BENDeclaration,
						W8BENForm: usr.W8BENForm,

						passport: retPassport,
						drivingLicense: retDl,
						voterCard: retVotercard,
						insurance: retInsurance,

						isVerified: usr.isVerified,
						wallet: usr.wallet,
						profileImage: usr.profileImage && usr.profileImage ?  `${path}${usr.profileImage}` : '',
						userName: usr.userName,
						loginType: usr.loginType,
						userType: usr.userType,
						deviceType: usr.deviceType,
						deviceToken: usr.deviceToken,
						email: usr.email,
						contactCountryCode: usr.contactCountryCode,
						countryCode: usr.countryCode,
						contactNo: usr.contactNo
					}
					return apiResponse.successResponseWithData(res, "Document Uploaded SuccessFully", returningobj)
				}
			})
		} catch (err) {
			console.log(err)
			return apiResponse.ErrorResponse(res, err);
		}
	}
]
// w8benform update 
exports.getAllusers = [
	(req, res) => {
		try {
			UserModel.find({}, function (err, user) {
				if (err) {
					return apiResponse.ErrorResponse(res, err)
				} else {
					const modusers = user.map((itm)=>{
					
						var count = 0
						const path = constants.urlPath.server_path
						var retPassport = {
							passportFront: '',
							passportBack: ''
						}
						var retDl = {
							drivingLicenseFront: '',
							drivingLicenseBack: ''
						}
						var retInsurance = {
							insuranceFront: '',
							insuranceBack: ''
						}
						var retVoterCard = {
							voterCardFront:'',
							voterCardBack: ''

						}
						if(itm.voterCard.voterCardFront && itm.voterCard.voterCardBack){
							retVoterCard.voterCardFront= path+itm.voterCard.voterCardFront
							retVoterCard.voterCardBack= path+itm.voterCard.voterCardBack
						}
						if(itm.insurance.insuranceFront && itm.insurance.insuranceBack){
							retInsurance.insuranceFront = path+itm.insurance.insurnaceFront
							retInsurance.insuranceBack = path+itm.insurance.insuranceBack
						}
						if(itm.drivingLicense.drivingLicenseFront && itm.drivingLicense.drivingLicenseBack){
							retDl.drivingLicenseFront = path+itm.drivingLicense.drivingLicenseFront
							retDl.drivingLicenseBack = path+itm.drivingLicense.drivingLicenseBack
						}
						if(itm.passport.passportFront && itm.passport.passportBack){
							retPassport.passportFront = path+itm.passport.passportFront
							retPassport.passportBack = path+itm.passport.passportBack
						}
						if(itm.profileImage){
							itm.profileImage = path+itm.profileImage
						}
						itm.drivingLicense = retDl
						itm.passport = retPassport
						itm.insurance = retInsurance
						itm.voterCard = retVoterCard
					})
					return apiResponse.successResponseWithData(res, "All users List",user)
				}
			})

		} catch (err) {
			return apiResponse.ErrorResponse(res, err)
		}
	}
]

exports.deleteUser = [
	(req, res) => {
		try {
			console.log("in the controller")
			UserModel.findOneAndDelete({ _id: req.params.id }, function (err, users) {
				if (err) {
					return apiResponse.ErrorResponse(res, err)
				} else if (users) {

					return apiResponse.successResponseWithData(res, "deleted users", users)
				}
			})

		} catch (err) {
			return apiResponse.ErrorResponse(res, err)
		}
	}
]

exports.updateContactNo = [
	auth,
	body("contactCountryCode").isLength({ min: 1 }).trim().withMessage("contactCountrycode is required"),
	body("contactNo").isLength({ min: 1 }).trim().withMessage("Contact No must be specified."),
	body("contactNo").escape(),
	(req, res) => {
		console.log("in this controller")
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			const updat = {
				contactCountryCode: req.body.contactCountryCode,
				contactNo: req.body.contactNo
			}
			UserModel.findOneAndUpdate({ _id: req.user._id }, updat, { new: true }).exec(function (err, usr) {
				if (err) {
					return apiResponse.ErrorResponse(res, err)
				} else {

					
					var count = 0
					var documents = false
					const path = constants.urlPath.server_path
					const retPassport = {
						passportFront: "",
						passportBack: ''
					}
					const retVotercard = {
						voterCardFront: "",
						voterCardBack: ''
					}
					const retDl = {
						drivingLicenseFront: "",
						drivingLicenseBack: ''
					}
					const retInsurance = {
						insuranceFront: "",
						insuranceBack: ''
					}

					if (usr.passport.passportFront && usr.passport.passportBack) {
						retPassport.passportFront = path+usr.passport.passportFront,
							retPassport.passportBack = path+usr.passport.passportBack
					}


					if (usr.voterCard.voterCardFront && usr.voterCard.voterCardBack) {
						retVotercard.voterCardFront = path+usr.voterCard.voterCardFront,
							retVotercard.voterCardBack = path+usr.voterCard.voterCardBack
					}

					if (usr.drivingLicense.drivingLicenseFront && usr.drivingLicense.drivingLicenseBack) {
						retDl.drivingLicenseFront = path+usr.drivingLicense.drivingLicenseFront,
							retDl.drivingLicenseBack = path+ usr.drivingLicense.drivingLicenseBack
					}


					if (usr.insurance.insuranceFront && usr.insurance.insuranceBack) {
						retInsurance.insuranceFront = path + usr.insurance.insuranceFront,
							retInsurance.insuranceBack = path +  usr.insurance.insuranceBack
					}

					usr.passport = retPassport,
						usr.insurance = retInsurance,
						usr.drivingLicense = retDl,
						usr.voterCard = retVotercard,
						usr.profileImage = usr.profileImage && usr.profileImage !== '' ? `${path}${usr.profileImage}` : ''

					console.log(usr,"user")



					return apiResponse.successResponseWithData(res, "Updated contact number", usr)
				}
			})
		} catch (err) {
			return apiResponse.ErrorResponse(err)
		}
	}
]

exports.updatewbenform = [
	body("w8benform").isLength({ min: 1 }).trim().withMessage("tax exemption must be specified."),
	body("w8benform").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			UserModel.findById(req.params.id, function (err, foundUser) {
				if (err) {
					return apiResponse.notFoundResponse(res, "User not exists with this id");
				} if (foundUser === null) {
					return apiResponse.notFoundResponse(res, "User not exists with this id");
				} else {
					const updat = {
						W8BENForm: req.body.w8benform,
					}
					UserModel.findOneAndUpdate({ _id: req.params.id }, updat, { new: true }).exec(function (err, usr) {
						if (err) {
							return apiResponse.ErrorResponse(res, err)
						} else {
							return apiResponse.successResponse(res, "updated users W8BENForm")
						}
					})
				}
			})
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
]




exports.updateWBENDeclaration= [
	body("W8BENDeclaration").isLength({ min: 1 }).trim().withMessage("W-8BENDeclaration must be specified."),
	body("W8BENDeclaration").escape(),
	(req, res) => {
		try {
			console.log("in the controller")
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			UserModel.findById(req.params.id, function (err, foundUser) {
				if (err) {
					return apiResponse.notFoundResponse(res, "User not exists with this id");
				} if (foundUser === null) {
					return apiResponse.notFoundResponse(res, "User not exists with this id");
				} else {
					const updat = {
						W8BENDeclaration: req.body.W8BENDeclaration,
					}
					UserModel.findOneAndUpdate({ _id: req.params.id }, updat, { new: true }).exec(function (err, usr) {
						if (err) {
							return apiResponse.ErrorResponse(res, err)
						} else {
							console.log(usr)
							return apiResponse.successResponse(res, "updated users W-8BENDeclaration")
						}
					})
				}
			})
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
]

exports.createNewPassword = [
	auth,
	body("oldPassword").isLength({ min: 6 }).trim().withMessage("oldPassword must be 6 characters."),
	body("password").isLength({ min: 6 }).trim().withMessage("Password must be 6 characters."),
	body("oldPassword").escape(),
	body("password").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			if(req.body.oldPassword === req.body.password){
			
				return apiResponse.ErrorResponse(res,"New pasword cant be same as old password")
			}

			// return apiResponse.successResponse("yes update pass")
			UserModel.findOne({ _id: req.user._id }, function (err, found) {
				if (err) {
					return apiResponse.ErrorResponse(res, err)
				}
				if (!found) {
					return apiResponse.ErrorResponse(res, "could not find user")
				}
				if (found) {
					console.log("foundUSer", found)
					bcrypt.compare(req.body.oldPassword, found.password, function (error, same) {
						if (err) {
							return apiResponse.ErrorResponse(res, error)
						}
						if (!same) {
							return apiResponse.ErrorResponse(res, "Old Password did not match")
						}
						if (same) {
							bcrypt.hash(req.body.password, 10, function (err, hash) {
								const updat = { password: hash }
								UserModel.findOneAndUpdate({ _id: req.user._id }, updat, { new: true }).exec(function (err, usr) {
									if (err) {
										return apiResponse.ErrorResponse(res, err)
									} else {
										return apiResponse.successResponse(res, "Password Updated Successfully")
									}
								})
							})
						}
					})
				}
			})
		} catch (err) {
			return apiResponse.ErrorResponse(res, err)
		}
	}
]

exports.updatePasswordfromOtp = [
	body("password").isLength({ min: 6 }).trim().withMessage("Password must be 6 characters."),
	body("email").isLength({ min: 1 }).trim().withMessage("email must be specified."),
	body("email").escape(),
	body("password").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			UserModel.findOne({ email: req.body.email }, (err, found) => {
				if (err) {
					return apiRespons.ErrorResponse(res, err)
				} else {
					if (found) {
						var date = new Date()
						// console.log(found.verificationTime)
						var verificationdate = found.verificationTime
						console.log(typeof date)

						if (Math.ceil(Math.abs(date.getTime() - found.verificationTime.getTime()) / 1000) < 60) {
							bcrypt.hash(req.body.password, 10, function (err, hash) {
								if (err) {
									return apiResponse.ErrorResponse(res, err)
								}
								const updat = {
									onetimepassword: "",
									password: hash
								}
								UserModel.findOneAndUpdate({ email: req.body.email }, updat, { new: true }).exec(function (err, usr) {
									if (err) {
										return apiResponse.ErrorResponse(res, err)
									} else {
										console.log('update')
										return apiResponse.successResponse(res, "Password successfully updated",)
									}
								})
							})
						} else {
							return res.status(404).send("Time limit exceeded")
						}
					}
				}
			})
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
]

exports.verifyOtp = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified."),
	body("otp").isLength({ min: 1 }).trim().withMessage("otp must be specified."),
	body("otp").escape(),
	body("email").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			UserModel.findOne({ email: req.body.email }, (err, found) => {
				if (err) {
					console.log(err)
					return apiRespons.ErrorResponse(res, err)
				} else {
					if (!found) {
						return apiResponse.ErrorResponse(res, "Cannot find the user")
					}
					if (found && found.onetimepassword === req.body.otp) {
						console.log(found)
						var date = new Date();

						const updat = {
							verificationTime: date,
							onetimepassword: ""
						}

						UserModel.findOneAndUpdate({ email: req.body.email }, updat, { new: true }).exec(function (err, usr) {
							if (err) {
								return apiResponse.ErrorResponse(res, err)
							} else {
								console.log(usr)
								return apiResponse.successResponse(res, "OTP Successfully Verified",)
							}
						})

					} else {
						return apiResponse.ErrorResponse(res, "OTP cant be verified")
					}
				}
			})

		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
]

exports.sendforgotPassOtpToMail = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified."),
	body("email").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			UserModel.findOne({ email: req.body.email }, (err, found) => {
				if (err) {
					console.log(err)
					return apiRespons.ErrorResponse(res, err)
				} else {
					if (!found) {
						return apiResponse.successResponse(res, "Cannot find the user")
					}
					if (found) {
						let otp = utility.randomNumber(4);
						const transporter = nodemailer.createTransport({
							port: 465,               // true for 465, false for other ports
							host: Host,
							auth: {
								user: Email,// specify your email here
								pass: Pass,// specify your password here
							},
							secure: true,
						});
						const mailData = {
							from: Email,  // sender address
							to: req.body.email,   // list of receivers
							subject: 'The OTP FOR CHANGE PASSWORD',
							html: "<p>Please Confirm your Account.</p><p>OTP: " + otp + "</p>",
						}
						transporter.sendMail(mailData, function (err, info) {
							if (err) {
								console.log(err)
								return apiResponse.ErrorResponse(res, err)
							}
							else
								var updat = {
									onetimepassword: otp
								}
							UserModel.findOneAndUpdate({ email: req.body.email }, updat, { new: true }).exec(function (err, usr) {
								if (err) {
									return apiResponse.ErrorResponse(res, err)
								} else {
									return apiResponse.successResponseWithData(res, "Sent OTP", otp)
								}
							})
						});
					}
				}
			})
		} catch {
			return apiResponse.ErrorResponse(res, err);
		}
	}
]

exports.updateNationality = [
	// auth,
	body("nationality").isLength({ min: 1 }).trim().withMessage("nationality must be specified."),
	body("countryOfResidency").isLength({ min: 1 }).trim().withMessage("countryOfResidency must be specified."),

	body("nationality").escape(),
	body("countryOfResidency").escape(),

	(req, res) => {
		try {
			console.log(req.body,"in thecontroolerererer")

			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}

			UserModel.findById(req.params.id, function (err, foundUser) {
				if (err) {
					return apiResponse.notFoundResponse(res, "User not exists with this id");
				} if (foundUser === null) {
					return apiResponse.notFoundResponse(res, "User not exists with this id");
				} else {
					// return apiResponse.successResponse(res, "user found")
					const updat = {
						nationality: req.body.nationality,
						countryOfResidency: req.body.countryOfResidency
					}
					UserModel.findOneAndUpdate({ _id: req.params.id }, updat, { new: true }).exec(function (err, usr) {
						if (err) {
							return apiResponse.ErrorResponse(res, err)
						} else {
							var count = 0
							const path = constants.urlPath.server_path
							
							var documents = false

							const retPassport = {
								passportFront: "",
								passportBack: ""
							}
							const retVotercard = {
								voterCardFront: "",
								voterCardBack: ""
							}
							const retDl = {
								drivingLicenseFront: '',
								drivingLicenseBack: ''
							}
							const retInsurance = {
								insuranceFront: '',
								insuranceBack: ''
							}



							if (usr.passport.passportFront && usr.passport.passportBack) {
							retPassport.passportFront = `${path}${usr.passport.passportFront}`
							retPassport.passportBack = `${path}${usr.passport.passportBack}`
							count = count + 1
							}
							if (usr.voterCard.voterCardFront && usr.voterCard.voterCardBack) {
							retVotercard.voterCardFront = `${path}${usr.voterCard.voterCardFront}`
							retVotercard.voterCardBack = `${path}${usr.voterCard.voterCardBack}`
							count = count + 1
							}
							if (usr.drivingLicense.drivingLicenseFront && usr.drivingLicense.drivingLicenseBack) {
							retDl.drivingLicenseFront = `${path}${usr.drivingLicense.drivingLicenseFront}`
							retDl.drivingLicenseBack = `${path}${usr.drivingLicense.drivingLicenseBack}`
							count = count + 1
							}
						if (usr.insurance.insuranceFront && usr.insurance.insuranceBack) {

							retInsurance.insuranceFront = `${path}${usr.insurance.insuranceFront}`
							retInsurance.insuranceBack = `${path}${usr.insurance.insuranceBack}`
							count = count + 1
						}
							if(count >1){
								documents = true
							}

							const returningobj = {
								_id: usr._id,
								documents: documents,

								passport: retPassport,
								voterCard: retVotercard,
								drivingLicense: retDl,
								insurance: retInsurance,

								nationality: usr.nationality,
								countryOfResidency: usr.countryOfResidency,
								// availableDocs: docs,
								W8BENDeclaration: usr.W8BENDeclaration,
								W8BENForm: usr.W8BENForm,
								isVerified: usr.isVerified,
								wallet: usr.wallet,
								profileImage:usr.profileImage && usr.profileImage !== "" ? `${path}${usr.profileImage}` : "",
								userName: usr.userName,
								loginType:usr.loginType,
								userType: usr.userType,
								deviceType: usr.deviceType,
								deviceToken: usr.deviceToken,
								contactCountryCode: usr.contactCountryCode,
								email: usr.email,
								countryCode: usr.countryCode,
								contactNo: usr.contactNo
							}
							return apiResponse.successResponseWithData(res, "updated users nationality", returningobj)
						}
					})
				}
			})
		} catch {
			return apiResponse.ErrorResponse(res, err);
		}
	}
]

exports.countriesNationality = [
	(req, res) => {
		try {
			return apiResponse.successResponseWithData(res, "nation and nationality list", CountriesAndNationality)
		} catch (err) {
			return apiResponse.ErrorResponse(res, err)
		}
	}
]

exports.updateProfileImage = [
	(req, res) => {
		try {
			if (!req.file || !req.file.path) {
				return apiResponse.ErrorResponse(res, "Error in cannot find profileImage Path")
			}
			UserModel.findOne({ _id: req.params.id }, function (err, found) {
				if (err) {
					return apiResponse.ErrorResponse(res, err)
				}
				if (!found) {
					return apiResponse.ErrorResponse(res, "User Not Found")
				}
				if (found) {
					const updat = {
						profileImage: req.file.path
					}
					UserModel.findOneAndUpdate({ _id: req.params.id }, updat, { new: true }).exec(function (err, usr) {
						if (err) {
							console.log(err)
							return apiResponse.ErrorResponse(res, err)
						} else {
							var count = 0
							const path = constants.urlPath.server_path
							var documents = false



							var retPassport = {
								passportFront: '',
								passportBack: ''
							}
							var retDl = {
								drivingLicenseFront: '',
								drivingLicenseBack: ''
							}
							var retVotercard = {
								voterCardFront: '',
								voterCardBack: ''
							}
							var retInsurance = {
								insuranceFront: '',
								insuranceBack: ''
							}


							if (usr.drivingLicense.drivingLicenseFront && usr.drivingLicense.drivingLicenseBack) {
								retDl.drivingLicenseFront = path + usr.drivingLicense.drivingLicenseFront
								retDl.drivingLicenseBack = path + usr.drivingLicense.drivingLicenseBack
								count = count + 1
							}
							if (usr.passport.passportFront && usr.passport.passportBack) {
								retPassport.passportFront =path + usr.passport.passportFront
								retPassport.passportBack = path + usr.passport.passportBack
								count = count + 1
							}
							if (usr.insurance.insuranceFront && usr.insurance.insuranceBack) {
								retInsurance.insuranceFront = path + usr.insurance.insuranceFront 
								retInsurance.insuranceBack = path + usr.insurance.insuranceBack
								count = count + 1
							}
							if (usr.voterCard.voterCardFront && usr.voterCard.voterCardBack) {
								retVotercard.voterCardFront = path + usr.voterCard.voterCardFront
      								retVotercard.voterCardBack = path + usr.voterCard.voterCardBack
								count = count + 1
							}

							if (count === 0) {
								document = false
							} else if (count > 1) {
								documents = true
							}

							usr.passport = retPassport
							usr.voterCard= retVotercard
							usr.drivingLicense = retDl
							usr.insurance = retInsurance
							usr.profileImage = path+usr.profileImage

							return apiResponse.successResponseWithData(res,"profile pic updated successfully" ,usr)
						}
					})
				}
			})
		} catch (err) {
			return apiResponse.ErrorResponse(res, err)
		}
	}
]


exports.login = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	body("password").isLength({ min: 6 }).trim().withMessage("Password must be 6 characters."),
	body("email").escape(),
	body("password").escape(),
	(req, res) => {
		try {
			console.log("in the login controller")
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				console.log(constants.urlPath.server_path,"th ureol s")
				const path = constants.urlPath.server_path
				UserModel.findOne({ email: req.body.email }).then(user => {
					if (user) {
						//Compare given password with db's hash.
						bcrypt.compare(req.body.password, user.password, function (err, same) {
							if (same) {
								//Check account confirmation.
								//if(user.isConfirmed){
								// Check User's account active or not.
								if (user.userType == 'user') {
									console.log(user)
									var count = 0
									var documents = false
									



									const retPassport = {
										passportFront: "",
										passportBack: ""
									}
									const retVotercard = {
										voterCardFront: "",
										voterCardBack: ""
									}
									const retDl = {
										drivingLicenseFront: '',
										drivingLicenseBack: ''
									}
									const retInsurance = {
										insuranceFront: '',
										insuranceBack: ''
									}

									if (user.passport.passportFront && user.passport.passportBack) {
										retPassport.passportFront = `${path}${user.passport.passportFront}`
										retPassport.passportBack = `${path}${user.passport.passportBack}`
										count = count + 1
									}
									if (user.voterCard.voterCardFront && user.voterCard.voterCardBack) {
										retVotercard.voterCardFront = `${path}${user.voterCard.voterCardFront}`
										retVotercard.voterCardBack = `${path}${user.voterCard.voterCardBack}`
										count = count + 1
									}
									if (user.drivingLicense.drivingLicenseFront && user.drivingLicense.drivingLicenseBack) {
										retDl.drivingLicenseFront = `${path}${user.drivingLicense.drivingLicenseFront}`
										retDl.drivingLicenseBack = `${path}${user.drivingLicense.drivingLicenseBack}`
										count = count + 1
									}
									if (user.insurance.insuranceFront && user.insurance.insuranceBack) {

										retInsurance.insuranceFront = `${path}${user.insurance.insuranceFront}`
										retInsurance.insuranceBack = `${path}${user.insurance.insuranceBack}`
										count = count + 1
									}






									if (count > 1) {
										documents = true
									}

									let userData = {
										_id: user._id,
										userFullName: user.userFullName,
										documents: documents,
										email: user.email,
										W8BENDeclaration: user.W8BENDeclaration,
										W8BENForm: user.W8BENForm,
										nationality: user.nationality,
										countryOfResidency: user.countryOfResidency,
										drivingLicense: retDl,
										passport: retPassport,
										voterCard: retVotercard,
										insurance: retInsurance,
										isVerified: user.isVerified,
										contactNo: user.contactNo,
										wallet: user.wallet,
										userType: user.userType,


										deviceType: user.deviceType,
										deviceToken: user.deviceToken,
										loginType: user.loginType,


										contactCountryCode: user.contactCountryCode,
										// Actions: user.Actions,
										// otp: user.confirmOTP
									};
									//Prepare JWT token for authentication
									const jwtPayload = userData;
									const jwtData = {
										expiresIn: process.env.JWT_TIMEOUT_DURATION,
									};

									const secret = process.env.JWT_SECRET

									userData.profileImage = user.profileImage && user.profileImage !== '' ? `${path}${user.profileImage}` : '';

									
									// userData.fullContact = user.countryCode + user.contactNo;
									//Generated JWT token with Payload and secret.+

									userData.token = jwt.sign(jwtPayload, secret, jwtData);
									return apiResponse.successResponseWithData(res, "Login Success.", userData);
								} else {
									return apiResponse.unauthorizedResponse(res, "Unidentified User Type. Please contact admin.");
								}
								// }else{
								// 	return apiResponse.unauthorizedResponse(res, "Account is not confirmed. Please confirm your account.");
								// }
							} else {
								return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
							}
						});
					} else {
						return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
					}
				});
			}
		} catch (err) {
			console.log(err)
			return apiResponse.ErrorResponse(res, err);
		}
	}
];
