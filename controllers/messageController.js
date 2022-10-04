const express = require('express');
const messageModel = require("../models/messageModel");
const { body, validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/jwt");
const { constants } = require("../helpers/constants");
const { CountriesAndNationality } = require("../helpers/utility")

 /**
* message from user to user
* @param {String}     chatId
* @param {String}     senderId
* @param {String}     message
*/

exports.postMessage = [
    // Validate fields.
    body("chatId").isLength({ min: 1 }).trim().withMessage("chat Id must be specified."),
    body("senderId").isLength({ min: 1 }).trim().withMessage("sender Id type must be specified."),
    body("message").isLength({ min: 1 }).trim().withMessage("message must be specified."),
    async(req, res) => {
        const { chatId, senderId, message } = req.body;
        const messages = new messageModel({
            chatId,
            senderId,
            message,
        });
        try{
            const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
                const result = await messages.save();
                return apiResponse.successResponseWithData(res, "Message created successfully", result)
            }
        }catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
    }
];


// view messages

exports.viewMessage =[
    async(req, res) => {
    const { chatId } = req.params;
    try {
      const result = await messageModel.find({ chatId });
      return apiResponse.successResponseWithData(res, "Feched successfully", result)
    } catch (error) {
        return apiResponse.ErrorResponse(res, err);
    }
}];


// delete message

exports.deleteMessage =[
    async(req, res) => {
    const { chatId } = req.params;
    try {
      const result = await messageModel.findOneAndDelete({ chatId });
      return apiResponse.successResponseWithData(res, "Message deleted successfully", result)
    } catch (error) {
        return apiResponse.ErrorResponse(res, err);
    }
}];


