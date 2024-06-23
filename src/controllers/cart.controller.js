const cartServices = require("../services/cart.services");

// // Controller to add item to cart
const addToCartController = async (req, res) => {
  const data = await cartServices.addToCart(req.body);
  res.status(data.statusCode).json(data);
};

// // Controller to remove item from cart
const removeFromCartController = async (req, res) => {
  const data = await cartServices.removeFromCart(req.body);
  res.status(data.statusCode).json(data);
};

// // Controller to get all the cart items in each user
const getCartItemsController = async (req, res) => {
  const { userId } = req.params;
  const data = await cartServices.getCartItems(userId);
  res.status(data.statusCode).json(data);
};

// // Controller to checkout and initialize payment
const initializePaymentController = async (req, res) => {
  const data = await cartServices.initiatePayment(req.body);
  res.status(data.statusCode).json(data);
};

module.exports = {
  addToCartController,
  removeFromCartController,
  getCartItemsController,
  initializePaymentController,
};
