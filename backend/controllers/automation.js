const cheerio = require('cheerio');
const fetch = global.fetch || require('node-fetch'); // Use built-in or polyfill
const SearchResult = require('../models/SearchResults.js')

// 🔍 Spani
async function fetchSpaniProducts(query) {
  console.log(`[Spani] Searching for: ${query}`);
  const url = `https://www.spaniatacadista.com.br/buscapagina?ft=${query}`;

  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    const products = [];

    $('.prateleira .produto').each((_, el) => {
      const name = $(el).find('.nome-produto').text().trim();
      const price = $(el).find('.preco-avista .preco-por').text().trim();
      const link = $(el).find('a').attr('href');
      if (name && price) {
        products.push({
          name,
          price,
          link: `https://www.spaniatacadista.com.br${link}`,
        });
      }
    });

    console.log(`[Spani] Found ${products.length} products`);
    return products;
  } catch (err) {
    console.error(`[Spani] Error fetching products:`, err.message);
    return [];
  }
}

// 🔍 Atacadão
async function fetchAtacadaoProducts(query) {
  console.log(`[Atacadão] Searching for: ${query}`);
  const url = `https://www.atacadao.com.br/api/catalog_system/pub/products/search/${query}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.warn(`[Atacadão] Unexpected response format`);
      return [];
    }

    const products = data.map((p) => {
      let finalLink = p.link;

      // 🛠️ Force replace the secure domain if present
      if (finalLink.startsWith("https://secure.atacadao.com.br")) {
        finalLink = finalLink.replace("https://secure.atacadao.com.br", "https://www.atacadao.com.br");
      } else if (!finalLink.startsWith("http")) {
        finalLink = `https://www.atacadao.com.br${finalLink}`;
      }

      return {
        name: p.productName,
        price: p.items[0]?.sellers[0]?.commertialOffer?.Price,
        link: finalLink,
      };
    });

    console.log(`[Atacadão] Found ${products.length} products`);
    return products;
  } catch (err) {
    console.error(`[Atacadão] Error fetching products:`, err.message);
    return [];
  }
}


// 🔍 Tenda
async function fetchTendaProducts(query) {
  console.log(`[Tenda] Searching for: ${query}`);
  const url = `https://www.tendaatacado.com.br/api/catalog_system/pub/products/search/${query}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.warn(`[Tenda] Unexpected response format`);
      return [];
    }

    const products = data.map((p) => ({
      name: p.productName,
      price: p.items[0]?.sellers[0]?.commertialOffer?.Price,
      link: `https://www.tendaatacado.com.br${p.link}`,
    }));

    console.log(`[Tenda] Found ${products.length} products`);
    return products;
  } catch (err) {
    console.error(`[Tenda] Error fetching products:`, err.message);
    return [];
  }
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
    // ⏰ Date boundaries for "today"
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // 🔍 Check if result for this query already exists today
    const existing = await SearchResult.findOne({
      query: term,
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    });

    const [spani, atacadao, tenda] = await Promise.all([
      fetchSpaniProducts(term),
      fetchAtacadaoProducts(term),
      fetchTendaProducts(term),
    ]);

    if (existing) {
      console.log(`[API] Existing result found for '${term}' today – skipping save`);
      return res.json({
        query: term,
        results: { spani, atacadao, tenda },
      });
    }

    // Clean data before saving (no link)
    const cleanSpani = spani.map(({ name, price }) => ({ name, price }));
    const cleanAtacadao = atacadao.map(({ name, price }) => ({ name, price }));
    const cleanTenda = tenda.map(({ name, price }) => ({ name, price }));

    const saved = await SearchResult.create({
      query: term,
      spani: cleanSpani,
      atacadao: cleanAtacadao,
      tenda: cleanTenda,
    });

    console.log(`[API] Saved new result for '${term}'`);

    return res.json({
      query: term,
      results: { spani, atacadao, tenda },
    });

  } catch (err) {
    console.error(`[API] Failed to fetch/save product data:`, err.message);
    return res.status(500).json({ error: 'Failed to fetch or save product data' });
  }
};