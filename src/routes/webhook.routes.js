const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/webhook.controller");

// // Webhook to verify the payment
router.post("/webhook", webhookController.paystackWebhookController);

module.exports = router;
