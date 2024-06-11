const responses = require("../utility/send.response");
const Cart = require("../models/cart.model");

// Add a course to the cart
const addToCart = async (payload) => {
  //the Payload takes the courseId and the UserId of the student
  const { userId, courseId } = payload;

  if (!userId || !courseId) {
    return responses.failureResponse("Id's are required", 400);
  }

  try {
    let cartItem = await Cart.findOne({ userId, courseId });
    // The course exists, increment the course quantity using mongodb Inc
    if (cartItem) {
      await Cart.updateOne({ userId, courseId }, { $inc: { quantity: 1 } });
    } else {
      // the course is not in the cart. Add a new item with quantity 1
      const newCartItem = new Cart({ userId, courseId, quantity: 1 });
      await newCartItem.save();
    }

    const updatedCart = await Cart.find({ userId });
    return responses.successResponse(
      "Here are your cart items",
      200,
      updatedCart
    );
  } catch (error) {
    return responses.failureResponse("Unable to add to cart", 500);
  }
};

const removeFromCart = async (payload) => {
  //the Payload takes the courseId and the UserId of the student
  const { userId, courseId } = payload;

  if (!userId || !courseId) {
    return responses.failureResponse("Id's are required", 400);
  }

  try {
    const cartItem = await Cart.findOne({ userId, courseId });

    if (!cartItem) {
      return responses.failureResponse("Course isn't found in the cart", 404);
    }

    // Remove the course from the cart
    if (cartItem.quantity > 1) {
      // Decrement the quantity if it's greater than 1
      await Cart.updateOne({ userId, courseId }, { $inc: { quantity: -1 } });
    } else {
      await Cart.deleteOne({ userId, courseId });
    }

    // Fetch the updated cart items for the user
    const updatedCartItems = await Cart.find({ userId });
    if (updatedCartItems.length === 0) {
      return responses.successResponse(
        "Cart is now empty",
        200,
        updatedCartItems
      );
    }
    return responses.successResponse(
      "Successfully removed from cart",
      200,
      updatedCartItems
    );
  } catch (error) {
    console.error("Error removing from cart:", error);
    return responses.failureResponse(
      "There was an error removing the course",
      500
    );
  }
};
module.exports = {
  addToCart,
  removeFromCart,
};
