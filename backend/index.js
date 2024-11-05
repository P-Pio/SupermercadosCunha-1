const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import routes
const itemRoutes = require("./routes/itemRoutes");
const supermarketRoutes = require("./routes/supermarketRoutes");
const priceRoutes = require("./routes/priceRoutes");
const overviewRoutes = require("./routes/overviewRoutes");
const brandRoutes = require("./routes/brandRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // for parsing application/json

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/items", itemRoutes);
app.use("/api/supermarkets", supermarketRoutes);
app.use("/api/prices", priceRoutes);
app.use("/api/overview", overviewRoutes);
app.use("/api/brands", brandRoutes);

// Define a catch-all route for any unhandled requests
app.use("*", (req, res) => {
  res.status(404).send("404 Not Found");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
