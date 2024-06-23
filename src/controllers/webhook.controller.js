const webhookServices = require("../services/webhook.service");

// Payment Verification Controller
const paystackWebhookController = async (req, res) => {
  const data = await webhookServices.paystackWebhook(req.body);
  res.status(data.statusCode).json(data);
};

module.exports = {
  paystackWebhookController,
};
