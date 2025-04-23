const SearchResult = require('../models/SearchResults.js');
const siteScrapers = require('../sites');

// 📌 List of tracked essential items (canonical names)
const essentialItems = [
  "Arroz 5kg",
  "Açúcar 5kg",
  "Feijão 1kg",
  "Óleo de Soja 900ml",
  "Farinha de milho 1kg",
  "Farinha de mandioca 500g",
  "Pó de Café 500g",
  "Macarrão 500g",
  "Farinha de trigo 1kg",
  "Leite UHT 1L",
  "Margarina 500g",
  "Banana 1kg",
  "Batata Inglesa 1kg",
  "Carne bovina contra filé 1kg",
  "Frango inteiro congelado 1kg"
];

// ✅ Ensure this helper is defined before using it
function matchEssentialItem(term) {
  return essentialItems.find(item =>
    item.toLowerCase() === term.trim().toLowerCase()
  ) || null;
}

/**
 * Clean product data for database storage
 * @param {Array} products - Array of product objects
 * @returns {Array} - Array of cleaned product objects
 */
function cleanProductData(products) {
  return products.map(({ name, price, quantity, unit }) => ({ 
    name, 
    price, 
    quantity: quantity || null, 
    unit: unit || '' // Ensure unit is always a string
  }));
}

// 🔁 API Endpoint
exports.searchExternalItems = async (req, res) => {
  const { term } = req.query;
  if (!term) {
    console.warn(`[API] Missing search term`);
    return res.status(400).json({ error: 'Missing search term' });
  }

  console.log(`[API] Incoming search for: ${term}`);

  try {
    const matchedItem = matchEssentialItem(term);
    const now = new Date();

    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

    // 🔍 Check for existing entry — based on item if matched, otherwise query
    const existingQuery = {
      createdAt: { $gte: startOfToday, $lte: endOfToday },
      ...(matchedItem ? { item: matchedItem } : { query: term }),
    };

    const existing = await SearchResult.findOne(existingQuery);

    // Get all available scrapers
    const { fetchSpaniProducts, fetchAtacadaoProducts, fetchTendaProducts } = siteScrapers;
    
    // Build an array of scraping tasks
    const scrapingTasks = [
      { name: 'spani', scraper: fetchSpaniProducts },
      { name: 'atacadao', scraper: fetchAtacadaoProducts },
      { name: 'tenda', scraper: fetchTendaProducts }
    ];

    // Execute all scraping tasks in parallel
    console.log(`[API] Starting parallel scraping for '${term}'`);
    const startTime = Date.now();
    
    const scrapingResults = await Promise.all(
      scrapingTasks.map(async ({ name, scraper }) => {
        try {
          const products = await scraper(term);
          console.log(`[API] ${name.charAt(0).toUpperCase() + name.slice(1)}: Found ${products.length} products`);
          return { name, products, error: null };
        } catch (err) {
          console.error(`[API] Error scraping ${name}:`, err.message);
          return { name, products: [], error: err.message };
        }
      })
    );
    
    // Convert results to an object
    const results = scrapingResults.reduce((acc, { name, products }) => {
      acc[name] = products;
      return acc;
    }, {});
    
    // Log performance summary
    const duration = Date.now() - startTime;
    console.log(`[API] All scraping completed in ${duration}ms`);
    console.log(`[API] Search results summary for '${term}':`);
    Object.entries(results).forEach(([site, products]) => {
      console.log(`[API] - ${site.charAt(0).toUpperCase() + site.slice(1)}: ${products.length} products`);
    });

    // Return existing data if it exists
    if (existing) {
      console.log(`[API] Skipping save – already exists for '${matchedItem || term}' today (ID: ${existing._id})`);
      return res.json({
        query: term,
        item: matchedItem,
        results,
        saved: false,
        existingId: existing._id,
      });
    }

    // Prepare clean data for database (remove extra fields)
    const cleanedData = Object.entries(results).reduce((acc, [site, products]) => {
      acc[site] = cleanProductData(products);
      return acc;
    }, {});

    // Save results to database
    const saved = await SearchResult.create({
      query: term,
      item: matchedItem,
      ...cleanedData
    });

    console.log(`[API] Saved result for '${matchedItem || term}' with ID: ${saved._id}`);

    res.json({
      query: term,
      item: matchedItem,
      results,
      saved: true,
      savedId: saved._id,
    });

  } catch (err) {
    console.error(`[API] Failed to fetch/save product data:`, err);
    return res.status(500).json({ 
      error: 'Failed to fetch or save product data',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};