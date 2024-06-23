const responses = require("../utility/send.response");
const Payment = require("../models/payment.model");
const axios = require("axios");

// Endpoint to verify payment on paystack
const paystackWebhook = async (payload) => {
  try {
    if (payload.event == "charge.success") {
      console.log("Payment successful");

      const transaction = await Payment.findOne({
        reference: payload.data.reference,
      });

      if (!transaction) {
        return responses.failureResponse(
          "This payment Reference does not exist",
          404
        );
      }

      const options = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      };

      const reference = payload.data.reference;

      const paystackURL = `${process.env.PAYSTACK_BASE_URL}/transaction/verify/${reference}`;

      const response = await axios.get(paystackURL, options);

      if (response.data.data.status == "success") {
        const updateObject = {
          transactionId: response.data.data.transactionId,
          channel: response.data.data.channel,
          paidAt: response.data.data.paidAt,
          currency: response.data.data.currency,
          status: response.data.data.status,
        };

        const updateTransaction = await Payment.findByIdAndUpdate(
          { _id: transaction.id },
          updateObject,
          { new: true }
        );

        console.log("Transaction details", updateTransaction);
      }
    }

    return responses.successResponse("Transaction verified and Noted", 200);
  } catch (error) {
    console.error("Unable to generate webhook", error);
    return responses.failureResponse("Error Receiving Webhook", 500);
  }
};

module.exports = { paystackWebhook };
