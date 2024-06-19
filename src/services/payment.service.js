const axios = require("axios");

const Payment = require("../models/payment.model");
const responses = require("../utility/send.response");
const generateReference = require("../utility/payment/generateReference");

const initiatePayment = async () => {
  try {
  } catch (error) {
    console.log("Error in making payment:", error);
    return responses.failureResponse(error?.message, error?.statusCode);
  }
};
