const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes.js");
const connectDB = require("./config/database");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerSpec.js");

//Environment variables configuration
const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;

//Database
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
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.get("/", (req, res) => {
  return res.send(
    "Welcome to Techware Professional Services Learning Platform"
  );
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Server
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running good at port ${PORT}`);
});
