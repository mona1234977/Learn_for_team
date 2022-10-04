var express = require("express");
const userController = require("../controllers/userController");
var router = express.Router();
const multer = require("multer");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    //cb(null, new Date().toISOString() + file.originalname);
  cb(null, Date.now()+'-'+file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
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

var multipleUpload =upload.fields(
  [{
    name: 'drivingLicense',
    maxCount: 1 
   }, {
    name: 'passport',
    maxCount: 1
  },{
    name: 'voterCard',
    maxCount: 1
  },{
    name: 'insurance',
    maxCount: 1
  }
  ]
)


router.get('/',userController.getuserbyid)
router.put('/contactUpdate',userController.updateContact)
router.get('/searchUserbyId/',userController.getuserbybodyid)
router.get('/getAllCountries',userController.getAllCountries)
router.put('/updateNationality',userController.updateNationality)
router.put('/updateDp',upload.single("profilepicture"),userController.uploadDp)
router.put('/updateDocuments',
upload.fields([{
  name: 'drivingLicense',
  maxCount: 2
 }, {
  name: 'passport',
  maxCount: 2
},{
  name: 'voterCard',
  maxCount: 2
},{
  name: 'insurance',
  maxCount: 2
}]),userController.updateDocuments)

//router.delete("/:id", TransactionController.favoriteDelete);

module.exports = router;