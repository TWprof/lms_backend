const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");

router.post("/add", cartController.addToCartController);
router.post("/remove", cartController.removeFromCartController);

module.exports = router;
