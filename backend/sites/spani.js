const cheerio = require('cheerio');
const fetch = global.fetch || require('node-fetch'); // Use built-in or polyfill

/**
 * Fetches product data from Spani Online supermarket
 * @param {string} query - Search term
 * @returns {Promise<Array>} - Promise resolving to array of product objects
 */
async function fetchSpaniProducts(query) {
  console.log(`[Spani] Searching for: ${query}`);
  const encodedQuery = encodeURIComponent(query.trim());

  // Use direct search URL format - try without department parameter first
  const url = `https://www.spanionline.com.br/busca?termo=${encodedQuery}`;
  
  // Add debugging
  console.log(`[Spani] Search URL: ${url}`);

  try {
    // First check if there's a possible API endpoint we can use instead of scraping HTML
    const apiEndpoint = `https://www.spanionline.com.br/api/catalog_system/pub/products/search/${encodedQuery}`;
    
    console.log(`[Spani] Trying API endpoint first: ${apiEndpoint}`);
    
    try {
      const apiRes = await fetch(apiEndpoint, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        timeout: 5000 // 5 second timeout
      });
      
      if (apiRes.ok) {
        console.log('[Spani] API endpoint returned success!');
        const apiData = await apiRes.json();
        
        if (Array.isArray(apiData) && apiData.length > 0) {
          console.log(`[Spani] Found ${apiData.length} products from API`);
          
          // Process API data directly
          const products = apiData.map(item => {
            const name = item.productName || item.name || '';
            
            // Get price (try different possible properties)
            let price = null;
            if (item.price) {
              price = typeof item.price === 'number' ? item.price : parseFloat(item.price);
            } else if (item.items && item.items[0] && item.items[0].sellers && item.items[0].sellers[0]) {
              const priceData = item.items[0].sellers[0].commertialOffer || item.items[0].sellers[0].commercialOffer;
              if (priceData && priceData.Price) {
                price = priceData.Price;
              }
            }
            
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
            
            // Get link
            let link = '';
            if (item.link || item.url || item.detailUrl) {
              link = item.link || item.url || item.detailUrl;
            }
            
            // Ensure link is absolute
            if (link && !link.startsWith('http')) {
              link = `https://www.spanionline.com.br${link.startsWith('/') ? '' : '/'}${link}`;
            }
            
            return {
              name: name.substring(0, 200),
              price,
              quantity,
              unit,
              link,
              // Include source for debugging
              source: 'api'
            };
          }).filter(item => item.name && item.price);
          
          console.log(`[Spani] Processed ${products.length} valid products from API`);
          return products;
        }
      }
    } catch (apiError) {
      console.log(`[Spani] API approach failed: ${apiError.message}`);
      // Continue with HTML scraping approach
    }
    
    // Fall back to HTML scraping
    console.log('[Spani] Falling back to HTML scraping approach');
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.spanionline.com.br/',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    
    let html = await res.text();
    
    // Check if we got an actual HTML response or a redirect/error page
    if (html.length < 1000 || !html.includes('<body') || !html.includes('</body>')) {
      console.log(`[Spani] Received suspicious HTML response (length: ${html.length})`);
      console.log(`[Spani] Sample of response: ${html.substring(0, 100)}...`);
      
      // Try alternative URL format
      console.log('[Spani] Trying alternative URL format...');
      const altUrl = `https://www.spanionline.com.br/busca/?q=${encodedQuery}`;
      
      console.log(`[Spani] Alternative URL: ${altUrl}`);
      
      const altRes = await fetch(altUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });
      
      if (altRes.ok) {
        const altHtml = await altRes.text();
        if (altHtml.length > html.length) {
          console.log(`[Spani] Alternative URL returned larger response (${altHtml.length} bytes)`);
          html = altHtml;
        }
      }
    }
    
    const $ = cheerio.load(html);
    const products = [];
    
    // Check if this is a product page rather than a search page (user might have searched a specific product)
    const isSingleProductPage = $('body').hasClass('produto') || 
                              $('body').hasClass('product') || 
                              $('#productPage').length > 0 ||
                              $('.produto-info').length > 0;
                              
    if (isSingleProductPage) {
      console.log('[Spani] Detected single product page');
      
      // Extract single product info
      const name = $('h1').first().text().trim() || 
                 $('.product-name').first().text().trim() || 
                 $('.nome-produto').first().text().trim();
                 
      let priceText = '';
      const priceSelectors = ['.preco-produto', '.preco', '.price', '.product-price', 
                            '#product-price', '.valor-por', '.valor'];
                            
      for (const selector of priceSelectors) {
        const foundPrice = $(selector).first().text().trim();
        if (foundPrice && foundPrice.includes('R$')) {
          priceText = foundPrice;
          break;
        }
      }
      
      // Extract price
      let price = null;
      if (priceText) {
        const priceMatch = priceText.match(/R\$\s*(\d+[,.]\d+)/);
        if (priceMatch) {
          const priceStr = priceMatch[1].replace('.', '').replace(',', '.');
          price = parseFloat(priceStr);
        }
      }
      
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
      
      // Get current URL as product link
      const link = $('link[rel="canonical"]').attr('href') || url;
      
      if (name && price) {
        products.push({
          name: name.substring(0, 200),
          price,
          quantity,
          unit,
          link,
          source: 'single_product_page'
        });
        
        console.log(`[Spani] Extracted single product: ${name}`);
        return products;
      }
    }

    // First try to detect the structure by checking HTML structure
    console.log(`[Spani] Analyzing page structure...`);
    console.log(`[Spani] Page title: ${$('title').text()}`);
    
    // Log a small sample of the HTML to help with debugging
    const htmlSample = html.substring(0, 300) + '...';
    console.log(`[Spani] HTML sample: ${htmlSample}`);
    
    // Check for common patterns that indicate products on the page
    const hasProducts = html.includes('produto') || html.includes('product') || 
                       html.includes('R$') || html.includes('preco') || 
                       html.includes('price');
                       
    console.log(`[Spani] Page contains product indicators: ${hasProducts}`);
    
    // Try each selector until we find products
    let productElements = [];
    
    // Modern e-commerce sites often use data-* attributes for product info
    // Try a variety of possible product card selectors
    const possibleProductSelectors = [
      // Common product card selectors
      '.produto-card', '.product-card', '.card-produto', 
      '.product-item', '.item-produto', '.product', 
      // Data attribute selectors
      '[data-produto-id]', '[data-product-id]', '[data-cy="produto-card"]',
      // Specific class combinations
      '.produto.item', '.item.product', '.produto-container',
      // Other common patterns
      '.product-box', '.box-produto', '.produto-box',
      // More generic selectors (use cautiously)
      '.col-produto', '.product-col', '.produto-grid-item',
      // Very generic fallbacks (last resort)
      '.card', '.box', '.item'
    ];
    
    // Add more specific selectors based on common Brazilian e-commerce platforms
    const additionalSelectors = [
      '.produtos-container .produto', 
      '.lista-produtos .produto',
      '.products-list .product',
      '.resultItemsWrapper div[id*="product"]',
      '.search-result-container .item',
      '.vitrine-produtos .produto',
      '.showcase-products .product',
      '.prateleira .produto',
      '.shelf .product',
      '.container-fluid .row .col',  // Very generic but common in bootstrap-based sites
      '.resultItemsWrapper > div',
      '.busca-resultado > div'
    ];
    
    const allSelectors = [...possibleProductSelectors, ...additionalSelectors];
    
    for (const selector of allSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`[Spani] Found ${elements.length} products using selector "${selector}"`);
        productElements = elements;
        break;
      }
    }
    
    // Log some structure information for debugging
    console.log(`[Spani] Page has ${$('div').length} divs, ${$('a').length} links, ${$('img').length} images`);
    console.log(`[Spani] Price indicators: ${$('*:contains("R$")').length} elements contain 'R$'`);

    // If no products found with specific selectors, try a more generic approach
    if (productElements.length === 0) {
      console.log('[Spani] No products found with specific selectors, trying generic approach');
      
      // Create a new array to store matching elements
      let genericElements = [];
      
      // First try to find elements containing price with R$
      console.log('[Spani] Looking for elements containing price patterns');
      
      // Approach 1: Find elements containing R$ that might be product containers
      $('*').each((_, el) => {
        const $el = $(el);
        
        // Skip very large elements that are likely containers
        if ($el.find('*').length > 100) return;
        
        const text = $el.text();
        
        // Skip very small or large text
        if (text.length < 10 || text.length > 1000) return;
        
        // Check for Brazilian price format with R$
        if (/R\$\s*\d+[,.]\d+/.test(text)) {
          // Make sure it's not just a price element but a container with other info
          const hasMoreText = text.replace(/R\$\s*\d+[,.]\d+/g, '').trim().length > 15;
          
          // Look for common product indicators
          const mightBeProduct = 
            hasMoreText && 
            (text.match(/\d+\s*(kg|g|ml|l|un)/i) || // Has quantity units
             $el.find('img').length > 0 ||          // Has an image
             $el.find('a').length > 0);             // Has a link
             
          if (mightBeProduct) {
            genericElements.push(el);
          }
        }
      });
      
      // If still no products, try a more targeted approach with price classes
      if (genericElements.length === 0) {
        console.log('[Spani] Trying more targeted approach with price classes');
        
        // Look for elements with price classes and go up to find their product containers
        $('.preco, .price, .valor, [class*="preco"], [class*="price"]').each((_, el) => {
          const $el = $(el);
          
          // Go up to potential parent container (2-3 levels usually gets to product card)
          let possibleContainer = $el.parent().parent();
          
          // If the container is too big, try parent instead
          if (possibleContainer.find('*').length > 50) {
            possibleContainer = $el.parent();
          }
          
          // Check if it might be a product container
          if (possibleContainer.text().length > 20 && 
              possibleContainer.text().length < 500) {
            genericElements.push(possibleContainer[0]);
          }
        });
      }
      
      // Third approach - find elements with images and prices nearby
      if (genericElements.length === 0) {
        console.log('[Spani] Trying approach with images and nearby prices');
        
        $('img').each((_, el) => {
          const $el = $(el);
          const $parent = $el.parent().parent();
          
          // Check if parent contains price
          if (/R\$\s*\d+[,.]\d+/.test($parent.text())) {
            genericElements.push($parent[0]);
          }
        });
      }
      
      // Remove duplicates by converting to jQuery collection
      if (genericElements.length > 0) {
        productElements = $($.unique(genericElements));
        console.log(`[Spani] Found ${productElements.length} products using generic approach`);
      } else {
        console.log('[Spani] No products found using generic approach either');
        
        // Last resort - look for any elements with R$ and make a best guess
        const priceElements = $('*:contains("R$")').filter(function() {
          return $(this).children().length === 0 && 
                 /R\$\s*\d+[,.]\d+/.test($(this).text());
        });
        
        console.log(`[Spani] Found ${priceElements.length} price elements as last resort`);
        
        if (priceElements.length > 0) {
          // Try to go up a few levels to find product containers
          priceElements.each((_, el) => {
            const $el = $(el);
            let $container = $el.parent().parent();
            
            // If container has more content, it might be a product
            if ($container.text().length > 50 && 
                $container.text().length < 500) {
              genericElements.push($container[0]);
            }
          });
          
          if (genericElements.length > 0) {
            productElements = $($.unique(genericElements));
            console.log(`[Spani] Found ${productElements.length} products using last resort approach`);
          }
        }
      }
    }
    
    // Only process if we found products
    if (productElements.length > 0) {
      // Process found products
      productElements.each((_, el) => {
        const $el = $(el);
        
        // Try various possible name selectors
        const nameSelectors = [
          '.produto-nome', '.product-name', '.nome-produto', '.name',
          '.produto-titulo', '.product-title', '.titulo-produto', '.title',
          '.produto-descricao', '.product-description', '.descricao-produto', '.description',
          '[data-cy="produto-descricao"]', '[data-cy="product-name"]',
          'h2', 'h3', 'h4', '.card-title', '.title'
        ];
        
        let name = '';
        for (const selector of nameSelectors) {
          const foundName = $el.find(selector).first().text().trim();
          if (foundName && foundName.length > name.length) {
            name = foundName;
          }
        }
        
        // If still no name found, try to get the longest text node that doesn't contain price
        if (!name) {
          $el.find('*').each((_, child) => {
            const childText = $(child).clone().children().remove().end().text().trim();
            if (childText.length > name.length && !childText.includes('R$')) {
              name = childText;
            }
          });
        }
        
        // If still no name, use the first line of text
        if (!name) {
          name = $el.text().split('\n')[0].trim();
        }
        
        // Try various price selectors
        const priceSelectors = [
          '.produto-preco', '.product-price', '.preco-produto', '.price',
          '.preco', '.valor', '.price-value', '.valor-produto',
          '[data-cy="preco"]', '[data-cy="price"]',
          'span:contains("R$")', '.preco-por', '.price-now'
        ];
        
        let priceText = '';
        for (const selector of priceSelectors) {
          const foundPrice = $el.find(selector).first().text().trim();
          if (foundPrice && foundPrice.includes('R$')) {
            priceText = foundPrice;
            break;
          }
        }
        
        // If no price found via selectors, try to extract from the whole text
        if (!priceText) {
          const fullText = $el.text();
          const priceMatch = fullText.match(/R\$\s*(\d+[,.]\d+)/);
          if (priceMatch) {
            priceText = priceMatch[0];
          }
        }
        
        // Extract and clean the price
        let price = null;
        if (priceText) {
          // Extract digits and commas/periods
          const priceDigits = priceText.replace(/[^\d,.]/g, '');
          
          // Convert to number format (Brazilian currency format to decimal)
          if (priceDigits) {
            // Handle different number formats
            if (priceDigits.includes(',')) {
              price = parseFloat(priceDigits.replace('.', '').replace(',', '.'));
            } else {
              price = parseFloat(priceDigits);
            }
          }
        }
        
        // Find product link
        let link = '';
        const possibleLinkElements = $el.find('a');
        
        if (possibleLinkElements.length > 0) {
          // Prefer links that contain images or titles
          const productLinks = possibleLinkElements.filter((_, link) => {
            const $link = $(link);
            return $link.find('img').length > 0 || 
                  $link.find('h2, h3, h4, .title, .name').length > 0;
          });
          
          if (productLinks.length > 0) {
            link = productLinks.first().attr('href') || '';
          } else {
            // Use the first link if no better match
            link = possibleLinkElements.first().attr('href') || '';
          }
        }
        
        // Ensure link is absolute
        if (link && !link.startsWith('http')) {
          link = `https://www.spanionline.com.br${link.startsWith('/') ? '' : '/'}${link}`;
        }
        
        // Extract quantity and unit from name
        let quantity = "";
        let unit = "";
        
        if (name) {
          // Common Brazilian quantity patterns (kg, g, ml, l, un)
          const qtyMatch = name.match(/(\d+(?:[,.]\d+)?)\s*(kg|g|gr|ml|l|un|pç|pc|pacote|caixa|cx|garrafa|lata|uni)/i);
          
          if (qtyMatch) {
            quantity = qtyMatch[1].replace(',', '.');
            unit = qtyMatch[2].toLowerCase();
          }
        }
        
        // Only add if we have at least a name and some price information
        if (name && price) {
          products.push({
            name: name.substring(0, 200),  // Limit name length
            price,
            quantity,
            unit,
            link,
            // Include original price text for debugging
            priceText: priceText || null
          });
        }
      });
    } else {
      console.log('[Spani] No products to process');
    }

    console.log(`[Spani] Found ${products.length} products`);
    return products;
  } catch (err) {
    console.error(`[Spani] Error fetching products:`, err);
    return [];
  }
}

module.exports = fetchSpaniProducts;