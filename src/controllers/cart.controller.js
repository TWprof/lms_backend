const cartServices = require("../services/cart.services");

const addToCartController = async (req, res) => {
  const data = await cartServices.addToCart(req.body);
  res.status(data.statusCode).json(data);
};
const removeFromCartController = async (req, res) => {
  const data = await cartServices.removeFromCart(req.body);
  res.status(data.statusCode).json(data);
};

module.exports = {
  addToCartController,
  removeFromCartController,
};
