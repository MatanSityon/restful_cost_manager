require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// Import route handlers
const costRoutes = require("./routes/cost");
const userRoutes = require("./routes/user");
const aboutRoutes = require("./routes/about");

const app = express();

/**
 * @file App Entry Point
 * @description Sets up the Express server, connects to MongoDB, and registers API routes.
 */

/**
 * Middleware to parse incoming JSON requests.
 * @type {Function}
 */
app.use(bodyParser.json());

/**
 * @route /api
 * @description Registers cost, user, and about API routes under the `/api` prefix.
 */
app.use("/api", costRoutes);
app.use("/api", userRoutes);
app.use("/api", aboutRoutes);

/**
 * Establishes a connection to MongoDB using the connection string from environment variables.
 * Logs success or failure to the console.
 * @returns {Promise<void>}
 */
mongoose
    .connect(process.env.MONGO_URI)
    .then(console.log("Connected to MongoDB"))
    .catch((err) => console.error(err));

/**
 * Starts the Express server unless the app is running in a test environment.
 * Prevents the server from starting during unit tests.
 * @description Starts the server on the specified port and logs the server URL.
 */
if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

/**
 * @module app
 * @description Exports the app for use in tests.
 */
module.exports = app; // Export the app for testing
