//Importing Libraries
const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// Importing modules from src
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes.js");

//Environment variables configuration
const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;

//Database
const connectDB = require("./config/database");
connectDB(process.env.MONGO_URI);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

//Routes
app.use(limiter);
app.use(morgan("combined"));
app.use(express.json());
app.use("/lms", userRoutes);
app.use("/lms-admin", adminRoutes);

// Server
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running good at port ${PORT}`);
});
