const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes.js");
const connectDB = require("./config/database");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerSpec.js");
const seedAdmin = require("./seeding/index.js");

//Environment variables configuration
const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;

//Database
connectDB(process.env.MONGO_URI);
seedAdmin();
// CORS OPTIONS
const corsOptions = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowHeaders: [
    "Content-Type",
    "Authorization",
    "Access-Control-Allow-Credentials",
  ],
};
//Routes
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/api/v1", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.get("/", (_req, res) => {
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
