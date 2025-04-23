const fetch = global.fetch || require('node-fetch'); // Use built-in or polyfill
const cheerio = require('cheerio');

/**
 * Fetches product data from Tenda Atacado supermarket
 * @param {string} query - Search term
 * @returns {Promise<Array>} - Promise resolving to array of product objects
 */
async function fetchTendaProducts(query) {
  console.log(`[Tenda] Searching for: ${query}`);
  // Encode the query by replacing spaces with '+'
  const encodedQuery = query.trim().replace(/\s+/g, '+');
  const url = `https://www.tendaatacado.com.br/busca?q=${encodedQuery}`;

  try {
    // First try to fetch using API if it exists
    console.log(`[Tenda] Trying API approach first`);
    const apiUrl = `https://www.tendaatacado.com.br/api/catalog_system/pub/products/search?ft=${encodedQuery}`;
    
    try {
      const apiRes = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        timeout: 5000 // 5 second timeout
      });
      
      if (apiRes.ok) {
        const data = await apiRes.json();
        
        if (Array.isArray(data) && data.length > 0) {
          console.log(`[Tenda] API returned ${data.length} products`);
          
          const products = data.map(p => {
            // Extract price from commertialOffer or commercialOffer (handle both spellings)
            let price = null;
            if (p.items && p.items[0] && p.items[0].sellers && p.items[0].sellers[0]) {
              const priceData = p.items[0].sellers[0].commertialOffer || p.items[0].sellers[0].commercialOffer;
              if (priceData && priceData.Price) {
                price = priceData.Price;
              }
            }
            
            // Extract quantity and unit from product name
            let quantity = "";
            let unit = "";
            const name = p.productName || p.name || '';
            
            if (name) {
              const qtyMatch = name.match(/(\d+(?:[,.]\d+)?)\s*(kg|g|gr|ml|l|un|pç|pc|pacote|caixa|cx|garrafa|lata|uni)/i);
              
              if (qtyMatch) {
                quantity = qtyMatch[1].replace(',', '.');
                unit = qtyMatch[2].toLowerCase();
              }
            }
            
            // Ensure link is absolute
            let link = p.link || '';
            if (link && !link.startsWith('http')) {
              link = `https://www.tendaatacado.com.br${link.startsWith('/') ? '' : '/'}${link}`;
            }
            
            return {
              name,
              price,
              link,
              quantity, 
              unit,
              source: 'tenda_api'
            };
          }).filter(p => p.name && p.price); // Remove items without name or price
          
          console.log(`[Tenda] Processed ${products.length} valid products from API`);
          return products;
        }
      }
    } catch (apiError) {
      console.error(`[Tenda] API approach failed:`, apiError.message);
      // Continue with HTML scraping
    }
    
    // Fall back to HTML scraping
    console.log(`[Tenda] Falling back to HTML scraping: ${url}`);
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const products = [];
    
    // Look for JSON-LD data in script tags (common in e-commerce sites)
    const jsonScripts = $('script[type="application/ld+json"]');
    
    if (jsonScripts.length > 0) {
      console.log(`[Tenda] Found ${jsonScripts.length} JSON-LD scripts in the HTML`);
      
      jsonScripts.each((_, script) => {
        try {
          const jsonData = JSON.parse($(script).html());
          
          // Check if it's product data
          if (jsonData['@type'] === 'Product') {
            const name = jsonData.name || '';
            let price = null;
            
            if (jsonData.offers && jsonData.offers.price) {
              price = parseFloat(jsonData.offers.price);
            }
            
            // Extract quantity and unit
            let quantity = "";
            let unit = "";
            
            if (name) {
              const qtyMatch = name.match(/(\d+(?:[,.]\d+)?)\s*(kg|g|gr|ml|l|un|pç|pc|pacote|caixa|cx|garrafa|lata|uni)/i);
              
              if (qtyMatch) {
                quantity = qtyMatch[1].replace(',', '.');
                unit = qtyMatch[2].toLowerCase();
              }
            }
            
            if (name && price) {
              products.push({
                name,
                price,
                link: jsonData.url || url,
                quantity,
                unit,
                source: 'json_ld'
              });
            }
          } else if (jsonData['@type'] === 'ItemList' && Array.isArray(jsonData.itemListElement)) {
            // Handle product lists
            jsonData.itemListElement.forEach(item => {
              if (item.item && item.item['@type'] === 'Product') {
                const product = item.item;
                const name = product.name || '';
                let price = null;
                
                if (product.offers && product.offers.price) {
                  price = parseFloat(product.offers.price);
                }
                
                // Extract quantity and unit
                let quantity = "";
                let unit = "";
                
                if (name) {
                  const qtyMatch = name.match(/(\d+(?:[,.]\d+)?)\s*(kg|g|gr|ml|l|un|pç|pc|pacote|caixa|cx|garrafa|lata|uni)/i);
                  
                  if (qtyMatch) {
                    quantity = qtyMatch[1].replace(',', '.');
                    unit = qtyMatch[2].toLowerCase();
                  }
                }
                
                if (name && price) {
                  products.push({
                    name,
                    price,
                    link: product.url || url,
                    quantity,
                    unit,
                    source: 'json_ld_list'
                  });
                }
              }
            });
          }
        } catch (e) {
          console.error(`[Tenda] Error parsing JSON-LD:`, e.message);
        }
      });
      
      if (products.length > 0) {
        console.log(`[Tenda] Found ${products.length} products from JSON-LD data`);
        return products;
      }
    }
    
    // If no products found in JSON-LD, try HTML scraping
    console.log(`[Tenda] Attempting to scrape products from HTML`);
    
    // Try different possible product selectors
    const productSelectors = [
      '.product-item', '.product', '.product-card', 
      '.shelf-item', '.product-box', '.productCard',
      '.product-container', '.product-block', '.item-produto'
    ];
    
    let productElements = [];
    
    for (const selector of productSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`[Tenda] Found ${elements.length} products using selector "${selector}"`);
        productElements = elements;
        break;
      }
    }
    
    // If no products found with specific selectors, try a more generic approach
    if (productElements.length === 0) {
      // Look for elements containing price patterns (R$)
      $('div, li, article').each((_, el) => {
        const $el = $(el);
        const text = $el.text();
        
        if (text.length > 10 && text.length < 500 && /R\$\s*\d+[,.]\d+/.test(text)) {
          productElements = productElements.add($el);
        }
      });
      
      console.log(`[Tenda] Found ${productElements.length} potential products using price pattern`);
    }
    
    // Process found products
    productElements.each((_, el) => {
      const $el = $(el);
      
      // Extract product name
      let name = '';
      const nameSelectors = ['.product-name', '.product-title', '.name', '.title', 'h2', 'h3', 'h4'];
      
      for (const selector of nameSelectors) {
        const foundName = $el.find(selector).first().text().trim();
        if (foundName && foundName.length > name.length) {
          name = foundName;
        }
      }
      
      // If no name found, try to get text that isn't price
      if (!name) {
        $el.find('*').each((_, child) => {
          const childText = $(child).clone().children().remove().end().text().trim();
          if (childText.length > 10 && !childText.includes('R$') && childText.length > name.length) {
            name = childText;
          }
        });
      }
      
      // Extract price
      let price = null;
      const priceMatch = $el.text().match(/R\$\s*(\d+[,.]\d+)/);
      
      if (priceMatch) {
        const priceStr = priceMatch[1].replace('.', '').replace(',', '.');
        price = parseFloat(priceStr);
      }
      
      // Extract link
      let link = $el.find('a').first().attr('href') || '';
      
      // Ensure link is absolute
      if (link && !link.startsWith('http')) {
        link = `https://www.tendaatacado.com.br${link.startsWith('/') ? '' : '/'}${link}`;
      }
      
      // Extract quantity and unit
      let quantity = "";
      let unit = "";
      
      if (name) {
        const qtyMatch = name.match(/(\d+(?:[,.]\d+)?)\s*(kg|g|gr|ml|l|un|pç|pc|pacote|caixa|cx|garrafa|lata|uni)/i);
        
        if (qtyMatch) {
          quantity = qtyMatch[1].replace(',', '.');
          unit = qtyMatch[2].toLowerCase();
        }
      }
      
      // Only add if we have essential information
      if (name && price) {
        products.push({
          name: name.substring(0, 200),  // Limit name length
          price,
          link,
          quantity,
          unit,
          source: 'html_scraping'
        });
      }
    });

    console.log(`[Tenda] Found ${products.length} products through HTML scraping`);
    return products;
  } catch (err) {
    console.error(`[Tenda] Error fetching products:`, err.message);
    return [];
  }
}

module.exports = fetchTendaProducts;