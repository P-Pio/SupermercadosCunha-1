const Price = require("../models/priceModel");

exports.getAllPrices = async (req, res) => {
  try {
    const prices = await Price.find()
      .populate("itemId", "name") // Assuming 'name' is the desired field from the Item model
      .populate("supermarketId", "name") // And from the Supermarket model
      .populate("brandId", "name"); // And from the Brand model
    res.json(prices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPrice = async (req, res) => {
  const price = new Price({
    itemId: req.body.itemId,
    supermarketId: req.body.supermarketId,
    price: req.body.price,
    brandId: req.body.brandId,
    unitValue: req.body.unitValue,
    unitType: req.body.unitType,
    city: req.body.city,  // Added city to the request body
    state: req.body.state // Added state to the request body
  });
  try {
    const newPrice = await price.save();
    res.status(201).json(newPrice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getPriceById = async (req, res) => {
  try {
    const price = await Price.findById(req.params.id)
      .populate("itemId", "name") // Same fields as above
      .populate("supermarketId", "name")
      .populate("brandId", "name");
    if (!price) return res.status(404).json({ message: "Price not found" });
    res.json(price);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePrice = async (req, res) => {
  try {
    const price = await Price.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("itemId", "name")
      .populate("supermarketId", "name")
      .populate("brandId", "name");
    res.json(price);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deletePrice = async (req, res) => {
  try {
    await Price.findByIdAndDelete(req.params.id);
    res.json({ message: "Price deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDateFromPeriod = (period) => {
  const date = new Date();
  switch (period) {
    case "40 days":
      date.setDate(date.getDate() - 40);
      break;
    case "3 months":
      date.setMonth(date.getMonth() - 3);
      break;
    case "6 months":
      date.setMonth(date.getMonth() - 6);
      break;
    case "1 year":
      date.setFullYear(date.getFullYear() - 1);
      break;
    default:
      date.setDate(date.getDate() - 40); // Default to last 40 days
  }
  return date;
};

exports.getHistoricalPrices = async (req, res) => {
  // Log entry point to make sure the function is being hit
  console.log("Entered getHistoricalPrices function");

  // Log the parameters and query received from the request
  console.log("Request Params (ID):", req.params);
  console.log("Request Query (Period):", req.query);

  const { id: itemId } = req.params;
  const { period } = req.query; // Only require `period` for date range

  // Check if the 'period' parameter is missing
  if (!period) {
    console.log("Period parameter is missing");
    return res.status(400).json({ message: "Missing period parameter" });
  }

  // Log the start and end date being used for the query
  const startDate = getDateFromPeriod(period);
  const endDate = new Date();
  console.log(`Start Date: ${startDate}, End Date: ${endDate}`);

  try {
    // Log the query being sent to the database
    console.log(`Fetching historical prices for Item ID: ${itemId}`);
    console.log(`Querying Prices with Date Range: ${startDate} to ${endDate}`);

    // Fetch all historical prices matching itemId and date range
    const historicalPrices = await Price.find({
      itemId: itemId,
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: 1 }); // Sort by date in ascending order

    // Log the result of the database query
    console.log(`Historical Prices Found: ${historicalPrices.length}`);

    // Check if no historical prices were found
    if (historicalPrices.length === 0) {
      console.log("No historical prices found");
      return res.status(404).json({ message: "No historical prices found" });
    }

    // If successful, return the historical prices
    res.status(200).json(historicalPrices);
  } catch (error) {
    // Log any errors that occur during the process
    console.error("Error fetching historical prices:", error);
    res
      .status(500)
      .json({ message: "Error fetching historical prices", error });
  }
};

