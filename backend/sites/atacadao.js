const fetch = global.fetch || require('node-fetch'); // Use built-in or polyfill

/**
 * Fetches product data from Atacadão supermarket
 * @param {string} query - Search term
 * @returns {Promise<Array>} - Promise resolving to array of product objects
 */
async function fetchAtacadaoProducts(query) {
  const encodedQuery = encodeURIComponent(query.trim());
  const url = `https://www.atacadao.com.br/api/catalog_system/pub/products/search/${encodedQuery}`;

  try {
      const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.warn(`[Atacadão] Unexpected response format: ${typeof data}`);
      return [];
    }


    const products = data.map((p) => {
      const item = p.items?.[0];
      const seller = item?.sellers?.[0];
      const offer = seller?.commertialOffer || seller?.commercialOffer;

      const quantity = item?.unitMultiplier || null;
      const unit = item?.measurementUnit || null;

      let finalLink = p.link || '';
      if (finalLink.startsWith("https://secure.atacadao.com.br")) {
        finalLink = finalLink.replace("https://secure.atacadao.com.br", "https://www.atacadao.com.br");
      } else if (!finalLink.startsWith("http")) {
        finalLink = `https://www.atacadao.com.br${finalLink.startsWith('/') ? '' : '/'}${finalLink}`;
      }

      return {
        name: p.productName || p.name || '',
        price: offer?.Price || offer?.ListPrice || null,
        link: finalLink,
        quantity,
        unit,
        // For debugging purposes
        source: 'atacadao_api'
      };
    }).filter(p => p.name && p.price); // Filter out products without name or price

    return products;
  } catch (err) {
    console.error(`[Atacadão] Error fetching products:`, err.message);
    
    // Try an alternative approach if the API fails
    try {
      const altUrl = `https://www.atacadao.com.br/busca/?q=${encodeURIComponent(query.trim())}`;
      
      const res = await fetch(altUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error with alternative approach! Status: ${res.status}`);
      }
      
      // Check if there's any structured data in the HTML that we can extract
      const html = await res.text();
      
      // Look for product data in JSON-LD format
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
      if (jsonLdMatch) {
        
        const products = [];
        
        for (const script of jsonLdMatch) {
          try {
            const jsonContent = script.replace(/<script type="application\/ld\+json">/i, '').replace(/<\/script>/i, '');
            const data = JSON.parse(jsonContent);
            
            if (data['@type'] === 'Product' || data['@type'] === 'ItemList') {
              if (data['@type'] === 'Product') {
                const name = data.name || '';
                let price = null;
                
                if (data.offers && data.offers.price) {
                  price = parseFloat(data.offers.price);
                }
                
                const link = data.url || altUrl;
                
                // Extract quantity and unit from name
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
                  products.push({ name, price, link, quantity, unit, source: 'json_ld_product' });
                }
              } else if (data['@type'] === 'ItemList' && Array.isArray(data.itemListElement)) {
                for (const item of data.itemListElement) {
                  if (item['@type'] === 'ListItem' && item.item) {
                    const product = item.item;
                    if (product['@type'] === 'Product') {
                      const name = product.name || '';
                      let price = null;
                      
                      if (product.offers && product.offers.price) {
                        price = parseFloat(product.offers.price);
                      }
                      
                      const link = product.url || altUrl;
                      
                      // Extract quantity and unit from name
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
                        products.push({ name, price, link, quantity, unit, source: 'json_ld_itemlist' });
                      }
                    }
                  }
                }
              }
            }
          } catch (e) {
            console.error(`[Atacadão] Error parsing JSON-LD:`, e.message);
          }
        }
        
        if (products.length > 0) {
          return products;
        }
      }
      
      return []; // Return empty array if both approaches fail
    } catch (altErr) {
      console.error(`[Atacadão] Alternative approach failed:`, altErr.message);
      return [];
    }
  }
}

module.exports = fetchAtacadaoProducts;