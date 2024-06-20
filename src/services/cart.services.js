const responses = require("../utility/send.response");
const Cart = require("../models/cart.model");
const Payment = require("../models/payment.model");
const axios = require("axios");
const generateReference = require("../utility/payment/generateReference");

// Add a course to the cart
const addToCart = async (payload) => {
  //the Payload takes the courseId and the UserId of the student
  const { userId, courseId, price } = payload;

  if (!userId || !courseId || price == null) {
    return responses.failureResponse("Id's and price is required", 400);
  }

  try {
    const cartItem = await Cart.findOne({ userId, courseId });
    // The course exists, increment the course quantity using mongodb Inc
    if (cartItem) {
      await Cart.updateOne(
        { userId, courseId },
        { $inc: { quantity: 1 }, $set: { price: price } }
      );
    } else {
      // the course is not in the cart. Add a new item with quantity 1
      const newCartItem = new Cart({ userId, courseId, quantity: 1, price });
      await newCartItem.save();
    }

    // Fetch the cart items for the user
    const updatedCart = await Cart.find({ userId });

    // calculate the total price
    const totalPrice = updatedCart.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
    console.log("Total Price:", totalPrice);

    return responses.successResponse("Here are your cart items", 200, {
      updatedCart,
      totalPrice,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
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
      return responses.successResponse("Cart is now empty", 200, {
        updatedCartItems,
        totalPrice: 0,
      });
    }

    // Calculate the total price
    const totalPrice = updatedCartItems.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );

    return responses.successResponse("Successfully removed from cart", 200, {
      updatedCartItems,
      totalPrice,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return responses.failureResponse(
      "There was an error removing the course",
      500
    );
  }
};

const getCartItems = async (userId) => {
  if (!userId) {
    return responses.failureResponse("userId is required", 400);
  }

  try {
    const cartItems = await Cart.find({ userId });

    if (cartItems.length === 0) {
      return responses.failureResponse("Cart is empty", 404);
    }

    // Calculate the total price
    const totalPrice = cartItems.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );

    return responses.successResponse("Cart items retrieved successfully", 200, {
      cartItems,
      totalPrice,
    });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    return responses.failureResponse("Unable to fetch cart items", 500);
  }
};

const initiatePayment = async (payload) => {
  const { userId, email } = payload;

  try {
    const fetchCart = await Cart.find({ userId, status: "pending" });
    if (!fetchCart.length) {
      return responses.failureResponse("Cart is empty", 400);
    }

    // to calculate the final price
    const totalPrice = fetchCart.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );

    const options = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    };

    const body = {
      email,
      amount: totalPrice * 100,
      reference: generateReference(),
      data: {
        cartId: fetchCart._id,
        userId,
      },
    };

    const response = await axios.post(process.env.PAYSTACK_URL, body, options);

    if (response.data.status) {
      const newPayment = new Payment({
        email,
        amount: totalPrice,
        date: new Date().toISOString(),
        status: "pending",
        reference: response.data.data.reference,
        user: userId,
        currency: "NGN",
      });

      await newPayment.save();

      // Update cart status to 'initiated'
      await Cart.updateMany(
        { userId, status: "pending" },
        {
          $set: {
            status: "initiated",
            paymentReference: response.data.data.reference,
          },
        }
      );

      return responses.successResponse(
        "Payment initialized successfully",
        200,
        {
          authorization_url: response.data.data.authorization_url,
          access_code: response.data.data.access_code,
          reference: response.data.data.reference,
        }
      );
    } else {
      return responses.failureResponse("Failed to initialize payment", 500);
    }
  } catch (error) {
    console.error("Error initiating payment:", error);
    return responses.failureResponse("Error initiating payment", 500);
  }
};
module.exports = {
  addToCart,
  removeFromCart,
  getCartItems,
  initiatePayment,
};
