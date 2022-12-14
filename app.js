// Import all dependecies
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const multer = require("multer")();
const compression = require("compression");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const yaml = require("yamljs");

const swaggerDoc = require("swagger-ui-express");
const swaggerDocumentation = yaml.load("./helpers/documentation.yaml");

const createHTTPError = require("http-errors");

// Import middlewares
const errorHandlerMiddleware = require("./middlewares/error-handler");

// Initiate app with express
const app = express();
const connectDB = require("./configs/db.config");

// Import and connect DB
if (process.env.NODE_ENV !== "test") {
  connectDB();
  app.listen(process.env.PORT || 3000);
}

// Import Routes
const goalRoutes = require("./routes/goal");
const courseRoutes = require("./routes/course");
const athenaeumRoutes = require("./routes/athenaeum");
const indexRoutes = require("./routes/index");

// Use gzip compression to decrease the size of the response body and increase speed of app
app.use(compression());

// Use helmet to procect against well known vulnerabilities
app.use(helmet());

// Parses incoming requests
app.use(multer.any());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sanitize user-supplied data to prevent MongoDB operator injections
app.use(mongoSanitize({ replaceWith: "_" }));

// Log the request
app.use(morgan("dev"));
// ---------------------

// Initiate Routes
app.use("/", indexRoutes);
app.use("/goals", goalRoutes);
app.use("/courses", courseRoutes);
app.use("/athenaeums", athenaeumRoutes);

app.use(
  "/documentations",
  swaggerDoc.serve,
  swaggerDoc.setup(swaggerDocumentation)
);

// ---------------------

// Handle error if the routes not found or there's problem in DB connection
app.use((req, res, next) => {
  next(createHTTPError(404, "Resource Not Found"));
});

// Error handler
app.use(errorHandlerMiddleware);
// ---------------------

module.exports = app;
