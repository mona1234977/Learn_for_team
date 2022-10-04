const express = require('express');
const ChatModel = require("../models/chatModel");
const UserModel = require("../models/UserModel");
const { body, validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/jwt");
const { constants } = require("../helpers/constants");
const { CountriesAndNationality } = require("../helpers/utility")


// create chat
exports.createChat = [
    // Validate fields.
    body("senderId").isLength({ min: 1 }).trim().withMessage("Sender ID must not be Empty."),
    body("receiverId").isLength({ min: 1 }).trim().withMessage("Receiver ID must not be Empty."),
    async(req, res) => {
        const newChat = new ChatModel({
        members: [req.body.senderId, req.body.receiverId],

    });
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
        }else{
            const result = await newChat.save();
            return apiResponse.successResponseWithData(res, "success", result)
      
        }
    }catch (err) {
        return apiResponse.ErrorResponse(res, err);
    }
}];


