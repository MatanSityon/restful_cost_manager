require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const costRoutes = require("./routes/cost");
const userRoutes = require("./routes/user");
const aboutRoutes = require("./routes/about");

const app = express();


// Middleware
app.use(bodyParser.json());

// Routes
app.use("/api", costRoutes);
app.use("/api", userRoutes);
app.use("/api", aboutRoutes);

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error(err));

// Only start the server if not in a test environment
if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}


module.exports = app;
