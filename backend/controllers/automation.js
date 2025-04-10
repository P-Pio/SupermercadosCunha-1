const cheerio = require('cheerio');
const fetch = global.fetch || require('node-fetch'); // Use built-in or polyfill
const SearchResult = require('../models/SearchResults.js')

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

// 🔍 Spani
async function fetchSpaniProducts(query) {
  console.log(`[Spani] Searching for: ${query}`);
  const encodedQuery = query.trim().replace(/\s+/g, '+');

  const url = `https://www.spanionline.com.br/busca?termo=${query}&departamento=0&page=1`;

  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    const products = [];

    $('vip-card-produto').each((_, el) => {
      const name = $(el).find('[data-cy="produto-descricao"]').text().trim();
      const price = $(el).find('[data-cy="preco"]').text().trim();
      const relativeLink = $(el).find('a').attr('href');
      const link = relativeLink?.startsWith('http')
        ? relativeLink
        : `https://www.spanionline.com.br${relativeLink}`;

      if (name && price) {
        products.push({
          name,
          price,
          link,
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
      const item = p.items[0];
      const seller = item?.sellers?.[0];
      const offer = seller?.commertialOffer;

      const quantity = item?.unitMultiplier || null;
      const unit = item?.measurementUnit || null;

      let finalLink = p.link || '';
      if (finalLink.startsWith("https://secure.atacadao.com.br")) {
        finalLink = finalLink.replace("https://secure.atacadao.com.br", "https://www.atacadao.com.br");
      } else if (!finalLink.startsWith("http")) {
        finalLink = `https://www.atacadao.com.br${finalLink}`;
      }

      return {
        name: p.productName,
        price: offer?.Price,
        link: finalLink,
        quantity,
        unit,
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
  // Encode the query by replacing spaces with '+'
  const encodedQuery = query.trim().replace(/\s+/g, '+');
  const url = `https://www.tendaatacado.com.br/busca?q=${encodedQuery}`;

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

    const [spani, atacadao, tenda] = await Promise.all([
      fetchSpaniProducts(term),
      fetchAtacadaoProducts(term),
      fetchTendaProducts(term),
    ]);

    if (existing) {
      console.log(`[API] Skipping save – already exists for '${matchedItem || term}' today`);
      return res.json({
        query: term,
        item: matchedItem,
        results: { spani, atacadao, tenda },
        saved: false,
        existingId: existing._id,
      });
    }

    // Prepare clean data
    const cleanSpani = spani.map(({ name, price, quantity, unity }) => ({ name, price, quantity, unity }));
    const cleanAtacadao = atacadao.map(({ name, price, quantity, unity }) => ({ name, price, quantity, unity }));
    const cleanTenda = tenda.map(({ name, price, quantity, unity }) => ({ name, price, quantity, unity }));

    // Save
    const saved = await SearchResult.create({
      query: term,
      item: matchedItem,
      spani: cleanSpani,
      atacadao: cleanAtacadao,
      tenda: cleanTenda,
    });

    console.log(`[API] Saved result for '${matchedItem || term}'`);

    res.json({
      query: term,
      item: matchedItem,
      results: { spani, atacadao, tenda },
      saved: true,
      savedId: saved._id,
    });

  } catch (err) {
    console.error(`[API] Failed to fetch/save product data:`, err.message);
    return res.status(500).json({ error: 'Failed to fetch or save product data' });
  }
};