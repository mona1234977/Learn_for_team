const express = require('express');
const UserModel = require("../models/UserModel");
// const Transaction = require("../models/TransactionModel");
//const Order = require('../models/OrderModel')
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const { constants } = require("../helpers/constants");
const {countries} = require('../helpers/utility')
const payment = require("../helpers/payment");

const utility = require("../helpers/utility");


exports.getAllCountries = [
  (req,res)=>{
    try {
      return apiResponse.successResponseWithData(res,"fetched countries succesfully",countries)
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  }
]

exports.getuserbyid = [
  auth,
  (req,res) => {
    try {
      console.log(req.user._id)
      UserModel.findById(req.user._id, function(err,doc){
        if(err){
          return apiResponse.ErrorResponse(res, err);
        }else if(!doc || doc.length < 1){
          return apiResponse.ErrorResponse(res, err);
        }else {
          return apiResponse.successResponseWithData(res,"user associated with id",doc)
        }
      })
      
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  }
]

exports.getuserbybodyid = [
  auth,
  (req,res) => {
    try {
      console.log(req.body.id)
      UserModel.findById(req.body.id, function(err,doc){
        if(err){
          return apiResponse.ErrorResponse(res, err);
        }else if(!doc || doc.length < 1){
          return apiResponse.ErrorResponse(res, err);
        }else {
          return apiResponse.successResponseWithData(res,"user associated with id",doc)
        }
      })
      
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  }
]

exports.updateContact = [
  auth,
  (req,res) => {
    try {
      const obj = {
        contactNo: req.body.contactNo
      }
    UserModel.findByIdAndUpdate(id, obj, {new: true}, function(err, model) {
      if(err){
        return apiResponse.ErrorResponse(res,err)
      }else if(model){
        return apiResponse.successResponseWithData(res,"Updated The User Contact",model)
      }
    })
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  }
]

exports.updateNationality = [
  auth,

  body("nationality","nationality must not be empty.").isLength({ min: 1 }).trim(),
	body("countryOfResidency").isLength({ min: 1 }).trim().withMessage("Country of Residency must be specified."),
  body("UsTaxExemption").isLength({ min: 1 }).trim().withMessage("UsTaxExemption must be specified."),

  body("nationality").escape(),
	body("countryOfResidency").escape(),
	
  (req,res) => {
    console.log(req.body)
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
      }
      const id = req.user._id
      UserModel.findById(req.user._id,function(err,doc){
        if(err){
          return apiResponse.ErrorResponse(res,err)
        }else if(doc){
          const obj = {
            nationality: req.body.nationality ? req.body.nationality : doc.contactNo,
            countryOfResidency: req.body.countryOfResidency ? req.body.countryOfResidency : doc.countryOfResidency,
            UsTaxExemption: req.body.UsTaxExemption ? req.body.UsTaxExemption : doc.UsTaxExemption
          }
          UserModel.findByIdAndUpdate(id, obj, {new: true}, function(err, model) {
            if(err){
              return apiResponse.ErrorResponse(res,err)
            }
            if(model){
              return apiResponse.successResponseWithData(res,"updated",model)
            }
          })
        }
      })
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  }
]


exports.uploadDp = [
  auth,
  (req,res) => {
    try {
      const id = req.user._id
      const obj = {
        profileImage: req.file.path
      }
      UserModel.findByIdAndUpdate(id, obj, {new: true}, function(err, model) {
        if(err){
          console.log(err)
          return apiResponse.ErrorResponse(res,err)
        }else if(model){
          return apiResponse.successResponseWithData(res,"profile picture updated successfully",model)
        }
      })
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  }
]

exports.updateDocuments = [
  auth,
  (req,res) => {
    try {
      console.log("CONTROLLER",req.files.voterCard)
      const id = req.user._id
      const dl = req.files.drivingLicense
      const pport = req.files.passport
      const vcard = req.files.voterCard
      const insuranc = req.files.insurance
      const passportArray = [];
      const dlArray = [];
      const vcardArray = [];
      const insurancArray = [];
      console.log(typeof dl ,dl.length)

      if(pport && pport.length > 0){
        pport.map((itm)=>{
          const insideObj = {
            path : itm.path
          }
          passportArray.push(insideObj)
        })
      }

      if(dl && dl.length > 0){
        dl.map((itm)=>{
          const insideObj = {
            path : itm.path
          }
          dlArray.push(insideObj)
        })
      }


      if(vcard && vcard.length > 0){
        vcard.map((itm)=>{
          const insideObj = {
            path : itm.path
          }
          vcardArray.push(insideObj)
        })
      }

      if(insuranc && insuranc.length > 0){
        insuranc.map((itm)=>{
          const insideObj = {
            path : itm.path
          }
          insurancArray.push(insideObj)
        })
      }

      console.log(vcardArray,"vcard")
      console.log(insurancArray,"insurance")

      const obj = {
        drivingLicense: dlArray,
        passport: passportArray,
        voterCard: vcardArray,
        insurance: insurancArray
      }
      UserModel.findByIdAndUpdate(id, obj, {new: true}, function(err, model) {
        if(err){
          console.log(err)
          return apiResponse.ErrorResponse(res,err)
        }else if(model){
          return apiResponse.successResponseWithData(res,"Passport picture updated successfully",model)
        }
      })
    } catch (err) {
      console.log(err)
      return apiResponse.ErrorResponse(res, err);
    }
  }
]

// newUser.find({ name: { $regex: "s", $options: "i" } }, function(err, docs) {
//   console.log("Partial Search Begins");
//   console.log(docs);
//   });