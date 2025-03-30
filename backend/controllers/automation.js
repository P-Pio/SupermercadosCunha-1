const cheerio = require('cheerio');
const fetch = global.fetch || require('node-fetch'); // Use built-in or polyfill

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
      const image = $(el).find('img').attr('src');
      const link = $(el).find('a').attr('href');
      if (name && price) {
        products.push({
          name,
          price,
          image,
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

    const products = data.map((p) => ({
      name: p.productName,
      price: p.items[0]?.sellers[0]?.commertialOffer?.Price,
      image: p.items[0]?.images[0]?.imageUrl,
      link: `https://www.atacadao.com.br${p.link}`,
    }));

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
      image: p.items[0]?.images[0]?.imageUrl,
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
    const [spani, atacadao, tenda] = await Promise.all([
      fetchSpaniProducts(term),
      fetchAtacadaoProducts(term),
      fetchTendaProducts(term),
    ]);

    console.log(`[API] Returning results for: ${term}`);
    res.json({
      query: term,
      results: {
        spani,
        atacadao,
        tenda,
      },
    });
  } catch (err) {
    console.error(`[API] Failed to fetch product data:`, err.message);
    res.status(500).json({ error: 'Failed to fetch product data' });
  }
};
