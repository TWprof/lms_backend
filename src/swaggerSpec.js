const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Techware Professional Services, LMS Backend API",
      version: "1.0.0",
      description: "A Learning Management System",
    },
    servers: [
      {
        url: "http://lms-backend-5t54.onrender.com",
        description: "Staging Server",
      },
      {
        url: "http://localhost:8024",
        description: "Local Server",
      },
    ],
  },
  apis: ["src/jsdocs/*.yaml"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
