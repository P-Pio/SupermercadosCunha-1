const fetch = global.fetch || require('node-fetch'); // Use built-in or polyfill
const cheerio = require('cheerio');

/**
 * Fetches product data from Tenda Atacado supermarket
 * @param {string} query - Search term
 * @returns {Promise<Array>} - Promise resolving to array of product objects
 */
async function fetchTendaProducts(query) {  
  // Store the original query words for filtering later
  const queryWords = query.toLowerCase().trim().split(/\s+/).filter(word => word.length > 2);
  
  // Encode the query by replacing spaces with '+'
  const encodedQuery = query.trim().replace(/\s+/g, '+');
  const url = `https://www.tendaatacado.com.br/busca?q=${encodedQuery}`;

  try {
    // Array to store all products (both from API and HTML scraping)
    let allProducts = [];

    // First try to fetch using API if it exists
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
          const apiProducts = data.map(p => {
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
          allProducts = apiProducts;
        }
      }
    } catch (apiError) {
      console.error(`[Tenda] API approach failed:`, apiError.message);
      // Continue with HTML scraping
    }
    
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
    
    // Create an array to store products from HTML scraping
    const scrapedProducts = [];
   
    // Log a small sample of the HTML to help with debugging
    const htmlSample = html.substring(0, 300) + '...';
    
    // Find all elements containing price text (R$)
    const priceElements = $('*').filter(function() {
      const text = $(this).text();
      return /R\$\s*\d+[,.]\d+/.test(text) && 
             text.length > 10 && 
             text.length < 500;
    });
    
    // Process each element with price information
    priceElements.each(function() {
      const $el = $(this);
      const elText = $el.text().trim();
      
      // Extract price from text
      const priceMatch = elText.match(/R\$\s*(\d+[,.]\d+)/);
      if (!priceMatch) return; // Skip if no price found
      
      const priceStr = priceMatch[1].replace('.', '').replace(',', '.');
      const price = parseFloat(priceStr);
      if (isNaN(price) || price <= 0) return; // Skip invalid prices
      
      // Extract product name
      // 1. Try to find a nearby heading or product name
      let name = '';
      
      // Check if this element has a header nearby
      const $parent = $el.parent();
      const $grandparent = $parent.parent();
      
      // Look for headings or common product name elements
      const $heading = $parent.find('h1, h2, h3, h4, h5, h6, .product-name, .product-title, .name, .title').first();
      if ($heading.length > 0) {
        name = $heading.text().trim();
      }
      
      // If no name found, try grandparent
      if (!name) {
        const $gpHeading = $grandparent.find('h1, h2, h3, h4, h5, h6, .product-name, .product-title, .name, .title').first();
        if ($gpHeading.length > 0) {
          name = $gpHeading.text().trim();
        }
      }
      
      // If still no name, look for specific patterns in text
      if (!name) {
        // Split the text by common separators and get the first part
        const textParts = elText.split(/\n|•|-|\|/);
        const filteredParts = textParts.filter(part => {
          const cleaned = part.trim();
          return cleaned.length > 5 && 
                 !cleaned.includes('R$') && 
                 !/^\d+([,.]\d+)?$/.test(cleaned);
        });
        
        if (filteredParts.length > 0) {
          name = filteredParts[0].trim();
        }
      }
      
      // If still no name found, use a reasonable part of the element text
      if (!name) {
        // Remove price information and trim
        name = elText.replace(/R\$\s*\d+[,.]\d+/, '').trim();
        
        // If name is still too long, truncate it
        if (name.length > 100) {
          name = name.substring(0, 100).trim();
        }
      }
      
      // If we have a product name and valid price, create product object
      if (name) {
        // Extract quantity and unit from name
        let quantity = "";
        let unit = "";
        
        const qtyMatch = name.match(/(\d+(?:[,.]\d+)?)\s*(kg|g|gr|ml|l|un|pç|pc|pacote|caixa|cx|garrafa|lata|uni)/i);
        if (qtyMatch) {
          quantity = qtyMatch[1].replace(',', '.');
          unit = qtyMatch[2].toLowerCase();
        }
        
        // Find a link if available
        let link = '';
        
        // Check element itself for a link
        const $selfLink = $el.closest('a');
        if ($selfLink.length > 0) {
          link = $selfLink.attr('href') || '';
        }
        
        // If no link found, check parent
        if (!link) {
          const $parentLink = $parent.find('a').first();
          if ($parentLink.length > 0) {
            link = $parentLink.attr('href') || '';
          }
        }
        
        // If still no link, check grandparent
        if (!link) {
          const $gpLink = $grandparent.find('a').first();
          if ($gpLink.length > 0) {
            link = $gpLink.attr('href') || '';
          }
        }
        
        // Ensure link is absolute
        if (link && !link.startsWith('http')) {
          link = `https://www.tendaatacado.com.br${link.startsWith('/') ? '' : '/'}${link}`;
        }
        
        scrapedProducts.push({
          name: name.substring(0, 200),  // Limit name length
          price,
          link,
          quantity,
          unit,
          source: 'direct_price_extraction'
        });
      }
    });
    
    // If no products found yet, try to search for structured data
    if (scrapedProducts.length === 0) {
      // Look for JSON-LD data in script tags
      const jsonScripts = $('script[type="application/ld+json"]');
      if (jsonScripts.length > 0) {      
        jsonScripts.each((_, script) => {
          try {
            const jsonData = JSON.parse($(script).html());
            
            if (jsonData['@type'] === 'Product') {
              // Process single product
              const name = jsonData.name || '';
              let price = null;
              
              if (jsonData.offers && jsonData.offers.price) {
                price = parseFloat(jsonData.offers.price);
              }
              
              if (name && price) {
                scrapedProducts.push({
                  name,
                  price,
                  link: jsonData.url || url,
                  quantity: '',
                  unit: '',
                  source: 'json_ld'
                });
              }
            } 
            else if (jsonData['@type'] === 'ItemList' && Array.isArray(jsonData.itemListElement)) {
              // Process list of products
              jsonData.itemListElement.forEach(item => {
                if (item.item && item.item['@type'] === 'Product') {
                  const product = item.item;
                  const name = product.name || '';
                  let price = null;
                  
                  if (product.offers && product.offers.price) {
                    price = parseFloat(product.offers.price);
                  }
                  
                  if (name && price) {
                    scrapedProducts.push({
                      name,
                      price,
                      link: product.url || url,
                      quantity: '',
                      unit: '',
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
      }
    }
    
    // If still no products, try to extract from script tags (last resort)
    if (scrapedProducts.length === 0) {
      // Find scripts with product data
      const scriptTags = $('script:not([src])').filter(function() {
        return $(this).text().includes('product') || 
               $(this).text().includes('price') || 
               $(this).text().includes('R$');
      });

      // Try to extract structured data
      scriptTags.each((_, script) => {
        const scriptText = $(script).text();
        
        // Look for array of products
        const productArrayMatches = scriptText.match(/\[\s*\{\s*["'].*?["']\s*:/g);
        if (productArrayMatches) {
          // Try to find the full array
          for (const match of productArrayMatches) {
            try {
              // Find opening bracket position
              const startPos = scriptText.indexOf(match);
              if (startPos === -1) continue;
              
              // Find the matching closing bracket
              let bracketCount = 1;
              let endPos = startPos + match.length;
              
              while (bracketCount > 0 && endPos < scriptText.length) {
                if (scriptText[endPos] === '[') bracketCount++;
                if (scriptText[endPos] === ']') bracketCount--;
                endPos++;
              }
              
              if (bracketCount === 0) {
                // Extract the potential JSON array
                const jsonString = scriptText.substring(startPos, endPos);
                
                try {
                  const data = JSON.parse(jsonString);
                  if (Array.isArray(data)) {
                    data.forEach(item => {
                      if (typeof item === 'object' && item !== null) {
                        // Look for name and price properties
                        const name = item.name || item.productName || item.title || '';
                        let price = null;
                        
                        if (typeof item.price === 'number') {
                          price = item.price;
                        } else if (typeof item.price === 'string' && item.price.includes('R$')) {
                          const priceMatch = item.price.match(/R\$\s*(\d+[,.]\d+)/);
                          if (priceMatch) {
                            price = parseFloat(priceMatch[1].replace('.', '').replace(',', '.'));
                          }
                        }
                        
                        if (name && price) {
                          scrapedProducts.push({
                            name,
                            price,
                            link: item.url || item.link || url,
                            quantity: '',
                            unit: '',
                            source: 'script_json'
                          });
                        }
                      }
                    });
                  }
                } catch (e) {
                  // Silently continue if parsing fails
                }
              }
            } catch (e) {
              // Silently continue if parsing fails
            }
          }
        }
      });
    }    
    // Add scraped products to allProducts array
    allProducts = [...allProducts, ...scrapedProducts];
    
    // Debug: Log all the different data columns found in products
    if (allProducts.length > 0) {
      const allColumns = new Set();
      allProducts.forEach(product => {
        Object.keys(product).forEach(key => allColumns.add(key));
      });
      
      // Log data types for each column
      const columnTypes = {};
      allProducts.forEach(product => {
        Object.entries(product).forEach(([key, value]) => {
          const type = typeof value;
          if (!columnTypes[key]) {
            columnTypes[key] = new Set();
          }
          columnTypes[key].add(type);
        });
      });
    }
    
    // Filter out duplicates using a more robust approach
    const uniqueProducts = filterDuplicateProducts(allProducts);
    
    // Apply query word filtering to ensure all products match ALL query words
    const filteredProducts = filterProductsByQueryWords(uniqueProducts, queryWords);
    
    // Format products according to the Mongoose schema
    const formattedProducts = formatProductsForMongoose(filteredProducts);
    
    return formattedProducts;
  } catch (err) {
    console.error(`[Tenda] Error fetching products:`, err.message);
    return [];
  }
}

/**
 * Filters duplicate products from an array of products
 * @param {Array} products - Array of product objects
 * @returns {Array} - Array of unique product objects
 */
function filterDuplicateProducts(products) {
  // Create a map to track seen products
  const seenProducts = new Map();
  const uniqueProducts = [];
  
  for (const product of products) {
    // Create normalized keys for comparison
    const nameKey = product.name.toLowerCase().trim();
    const priceKey = product.price.toFixed(2);
    
    // Create a composite key that considers both name and price
    const exactKey = `${nameKey}|${priceKey}`;
    
    // Create a simplified name key by removing common variations
    // Remove quantities, units, and extra spaces
    const simplifiedName = nameKey
      .replace(/\d+\s*(kg|g|gr|ml|l|un|pç|pc|pacote|caixa|cx|garrafa|lata|uni)(\b|$)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Create a fuzzy key that might catch more duplicates
    const fuzzyKey = `${simplifiedName}|${priceKey}`;
    
    // Check if we've seen this product before (exact or fuzzy match)
    if (!seenProducts.has(exactKey) && !seenProducts.has(fuzzyKey)) {
      // This is a new product
      seenProducts.set(exactKey, true);
      seenProducts.set(fuzzyKey, true);
      uniqueProducts.push(product);
    }
  }
  
  return uniqueProducts;
}

/**
 * Filters products to only include those that contain ALL query words
 * @param {Array} products - Array of product objects
 * @param {Array} queryWords - Array of query words to match
 * @returns {Array} - Array of filtered product objects
 */
function filterProductsByQueryWords(products, queryWords) {
  // If no query words provided or they're too short, return all products
  if (!queryWords || queryWords.length === 0) {
    return products;
  }
  
  return products.filter(product => {
    // Skip products without a name
    if (!product.name) return false;
    
    const productNameLower = product.name.toLowerCase();
    
    // Check if ALL query words are present in the product name
    return queryWords.every(word => {
      // Skip very short words (less than 3 chars)
      if (word.length < 3) return true;
      
      return productNameLower.includes(word);
    });
  });
}

/**
 * Formats products to match the Mongoose schema
 * @param {Array} products - Array of product objects
 * @returns {Array} - Array of formatted product objects
 */
function formatProductsForMongoose(products) {
  return products.map(product => {
    // Create a new object with the correct property names and include the link
    return {
      name: product.name || '',
      price: product.price || 0,
      quantity: product.quantity || '',
      unity: product.unit || '', // Map 'unit' to 'unity' as per schema
      link: product.link || '' // Include the product link
    };
  });
}

module.exports = fetchTendaProducts;