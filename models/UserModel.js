var mongoose = require("mongoose");
var UserSchema = new mongoose.Schema({
	email: { type: String, required: true },
	password: { type: String, required: true },
	userType: { type: String, required: true }, //admin,user
	contactNo: { type: String, required: false },
	userFullName: { type: String, required: true },
	wallet: { type: Number, required: false, default: 0 },


	deviceType: { type: String, required: true, default: "" },
	deviceToken: { type: String, required: true, default: "" },
	loginType: { type: String, required: true, default: 'admin' },


	contactCountryCode: { type: String, required: false, default: "" },


	passport: {
		passportFront: { type: String, required: false, default: 0 },
		passportBack: { type: String, required: false, default: 0 }
	},
	voterCard: {
		voterCardFront: { type: String, required: false, default: 0 },
		voterCardBack: { type: String, required: false, default: 0 }
	},
	insurance: {
		insuranceFront: { type: String, required: false, default: 0 },
		insuranceBack: { type: String, required: false, default: 0 }
	},
	drivingLicense: {
		drivingLicenseFront: { type: String, required: false, default: 0 },
		drivingLicenseBack: { type: String, required: false, default: 0 }
	},

	isVerified: { type: Boolean, required: false, default: false },
	nationality: { type: String, required: false, default: '' },
	profileImage: { type: String, required: false, default: '' },
	W8BENForm: { type: Boolean, required: false, default: false },
	onetimepassword: { type: String, required: false, default: '' },
	verificationTime: { type: Object, required: false, default: 0 },
	countryOfResidency: { type: String, requied: false, default: '' },
	W8BENDeclaration: { type: Boolean, required: false, default: false },
	// otpTries: {type: Number, required:false, default: 0},
}, { timestamps: true });

//Virtual for user's full name
// UserSchema
// 	.virtual("fullContact")
// 	.get(function () {
// 		return this.contactNo;
// 	});

module.exports = mongoose.model("User", UserSchema);
