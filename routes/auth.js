var express = require("express");
var router = express.Router();
const AuthController = require("../controllers/AuthController");
// const thirdpartyApi = require("../controllers/Auth_thirdparty_Controller");
// var cipController = require("../controllers/CIP_thirdParty");
const multer = require("multer");



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    //cb(null, new Date().toISOString() + file.originalname);
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {

	console.log("in the mimetype of the file filter checking")
  console.log(file.mimetype,"the mimetype",file)
  if (file.mimetype === "image/*" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === 'application/octet-stream') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limit: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

var multipleUpload = upload.fields(
  [{
    name: 'drivingLicenseFront',
    maxCount: 1
  }, {
    name: 'passportFront',
    maxCount: 1
  }, {
    name: 'voterCardFront',
    maxCount: 1
  }, {
    name: 'insuranceFront',
    maxCount: 1
  }, {
    name: 'drivingLicenseBack',
    maxCount: 1
  }, {
    name: 'passportBack',
    maxCount: 1
  }, {
    name: 'voterCardBack',
    maxCount: 1
  }, {
    name: 'insuranceBack',
    maxCount: 1
  }
  ]
)


router.post('/register', AuthController.register)
router.post('/updateWBENDeclaration/:id', AuthController.updateWBENDeclaration)
router.post('/W8BENForm/:id', AuthController.updatewbenform)
router.post('/uploadDocs/:id', multipleUpload, AuthController.updateDocuments)
router.post('/nationality/:id', AuthController.updateNationality)
router.post('/forgotOtp', AuthController.sendforgotPassOtpToMail)
router.post('/updateForgotPassword', AuthController.updatePasswordfromOtp)
router.post('/creteNewPass', AuthController.createNewPassword)
router.post('/verifyOtp/', AuthController.verifyOtp)
router.post("/resend-verify-otp/", AuthController.resendConfirmOtp)
router.post("/login",AuthController.login) 
router.get("/nationandNationality", AuthController.countriesNationality)
router.post("/verify-otp/:id", AuthController.verifyConfirm);
router.post('/updateContactInfo', AuthController.updateContactNo);
router.post("/updateProfileImage/:id",upload.single("profileImage"),AuthController.updateProfileImage);


router.get("/allusers/", AuthController.getAllusers);
router.delete('/deleteUser/:id', AuthController.deleteUser)

// router.get('/getStatus/', thirdpartyApi.getStatus)

// router.post("/register", multipleUpload, AuthController.register);
router.post("/adminlogin", AuthController.adminlogin);
// third party api data approve by admin
// router.post("/adminThirdData", thirdpartyApi.thirdparty_accountdata);
// router.get('/allINfo', thirdpartyApi.getusersAllInfo)
// router.get('/getTradingAcc', thirdpartyApi.getTraderAccount)
// router.get('/getBrokerageAcc', thirdpartyApi.getBrokerAccount)
// router.patch('/editAccount', thirdpartyApi.editUsersAccount)
// router.patch('/editAccount/:id', thirdpartyApi.editUsersAccountById)
// router.delete('/deleteAccount/:id', thirdpartyApi.deleteAccount)
// router.get('/get',thirdpartyApi.getAllUsersOnthirdParty)




// third party CIP route for register
// router.post("/cip/register", cipController.cipRegister);
router.post("/wallet", AuthController.getWallet);
router.post("/walletByMail", AuthController.getWalletByMail);
router.post("/checkSecurity", AuthController.checkSecurity);
router.put("/:id", AuthController.updateProfile);
router.post("/getProfile", AuthController.profile);
router.post("/profileByEmail", AuthController.profileByEmail);
router.post("/updateProfile/:id", upload.single("profileImage"), AuthController.updateProfile);
router.post("/getShippingAddress/", AuthController.getUserShipping);
router.post("/addUpdateShippingAddress/", AuthController.addUpdateShppingAddr);
router.post("/addUpdateShippingAddress/:id", AuthController.addUpdateShppingAddr);
router.post("/syncContact/", AuthController.testSync);
router.get('/allUsers', AuthController.allusers);
router.put('/update/:id', AuthController.UpdateUser)
router.put('/approveUser/:id', AuthController.ApproveUser)



//router.put('/updateAdmin/:id',AuthController.)
//router.post("/updateProfile/:id",upload.single("profileImage"),AuthController.updateProfile);



module.exports = router;
