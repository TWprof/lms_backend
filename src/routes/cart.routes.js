const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");

// // Route to add item to cart
router.post("/add", cartController.addToCartController);

// // Route to remove item from cart
router.post("/remove", cartController.removeFromCartController);

// // Route to get all items in the cart
router.get("/:userId", cartController.getCartItemsController);

// // Route to initialize payment for items in the cart
router.post("/checkout", cartController.initializePaymentController);

module.exports = router;
