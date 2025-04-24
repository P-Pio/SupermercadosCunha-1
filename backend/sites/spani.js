/**
 * Spani product scraper using direct API access with exact browser headers
 */
const fetch = global.fetch || require('node-fetch');

/**
 * Fetches product data from Spani Online supermarket
 * @param {string} query - Search term
 * @param {number} page - Page number (defaults to 1)
 * @returns {Promise<Array>} - Promise resolving to array of product objects
 */
async function fetchSpaniProducts(query, page = 1) {
  console.log(`[Spani] Searching for: ${query} (page ${page})`);
  const originalQuery = query.trim().toLowerCase();
  
  // Create the exact format seen in the network request (+ instead of spaces)
  const plusEncodedQuery = originalQuery.replace(/\s+/g, '+');
  
  try {
    // Use the exact API endpoint from the network request
    const apiEndpoint = `https://services-beta.vipcommerce.com.br/api-admin/v1/org/67/filial/1/centro_distribuicao/6/loja/buscas/produtos/termo/${plusEncodedQuery}?page=${page}&departamento=0`;
    
    console.log(`[Spani] Using API endpoint: ${apiEndpoint}`);
    
    // Copy exact headers from the browser request
    const apiRes = await fetch(apiEndpoint, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,pt;q=0.8',
        'authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJ2aXBjb21tZXJjZSIsImF1ZCI6ImFwaS1hZG1pbiIsInN1YiI6IjZiYzQ4NjdlLWRjYTktMTFlOS04NzQyLTAyMGQ3OTM1OWNhMCIsInZpcGNvbW1lcmNlQ2xpZW50ZUlkIjpudWxsLCJpYXQiOjE3NDQyNTg1NzQsInZlciI6MSwiY2xpZW50IjpudWxsLCJvcGVyYXRvciI6bnVsbCwib3JnIjoiNjcifQ.mAyfOpEf99Ht-2NZ6qbFr6TijHrGH4l8kn7ukAkfBOquYJ1pLKgQ5GBWVXKX7y_zKYH4p5M3-02haPmjWwcBNg',
        'content-type': 'application/json',
        'domainkey': 'spanionline.com.br',
        'organizationid': '67',
        'origin': 'https://www.spanionline.com.br',
        'referer': 'https://www.spanionline.com.br/',
        'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'sessao-id': '7a1c2992738ee01d7104b982628dee3a',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
      },
      timeout: 15000 // 15 second timeout
    });
    
    if (!apiRes.ok) {
      console.log(`[Spani] API request failed: ${apiRes.status} ${apiRes.statusText}`);
      return [];
    }
    
    let jsonData;
    try {
      const textData = await apiRes.text();
      
      // Check if it starts with HTML, which indicates it's not JSON
      if (textData.trim().startsWith('<!')) {
        console.log('[Spani] API returned HTML instead of JSON');
        throw new Error('API returned HTML instead of JSON');
      }
      
      jsonData = JSON.parse(textData);
    } catch (parseError) {
      console.log(`[Spani] API response parsing error: ${parseError.message}`);
      throw parseError;
    }
    
    // Check if we have valid data from the API
    if (jsonData.success && jsonData.data && Array.isArray(jsonData.data.produtos)) {
      const produtos = jsonData.data.produtos;
      console.log(`[Spani] Found ${produtos.length} products from API`);
      
      // Log pagination information if available
      if (jsonData.data.paginator) {
        const paginator = jsonData.data.paginator;
        console.log(`[Spani] Page ${paginator.page} of ${paginator.total_pages}, Total items: ${paginator.total_items}`);
      }
      
      // First filter products that contain ALL words in the search query
      const filteredProducts = produtos.filter(item => {
        // Skip if no description
        if (!item.descricao) return false;
        
        const description = item.descricao.toLowerCase();
        const queryWords = originalQuery.split(/\s+/);
        
        // Check if all query words are in the description
        return queryWords.every(word => description.includes(word));
      });
      
      console.log(`[Spani] Filtered to ${filteredProducts.length} products matching all query terms`);
      
      // Extract relevant data from filtered products
      const mappedProducts = filteredProducts.map(item => {
        // Get name/description
        const name = item.descricao || '';
        
        // Get price
        let price = null;
        if (item.preco) {
          price = typeof item.preco === 'number' ? item.preco : parseFloat(item.preco);
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
        
        // Use unit information from API if available
        if (item.unidade_sigla) {
          unit = item.unidade_sigla.toLowerCase();
        }
        
        return {
          name: name.trim(),
          price,
          quantity,
          unit,
          // For duplicate detection
          _id: item.produto_id || item.id || null
        };
      }).filter(item => item.name && item.price);
      
      console.log(`[Spani] Extracted data for ${mappedProducts.length} valid products`);
      
      // Normalize product names for better duplicate detection
      const normalizedProducts = mappedProducts.map(product => {
        // Create a normalized name by removing extra spaces and converting to lowercase
        const normalizedName = product.name
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .trim();
        
        return {
          ...product,
          normalizedName
        };
      });
      
      // Remove duplicates based on normalized name and price
      const uniqueProducts = [];
      const seen = new Map();
      
      for (const product of normalizedProducts) {
        // Create a unique key combining normalized name and price
        const key = `${product.normalizedName}|${product.price}`;
        
        if (!seen.has(key)) {
          seen.set(key, true);
          // Remove temporary fields before returning
          const { normalizedName, _id, ...cleanProduct } = product;
          uniqueProducts.push(cleanProduct);
        }
      }
      
      console.log(`[Spani] Reduced to ${uniqueProducts.length} unique products after removing duplicates`);
      return uniqueProducts;
    } else {
      console.log('[Spani] API response did not contain expected data structure');
      return [];
    }
  } catch (err) {
    console.error(`[Spani] Error fetching products:`, err);
    return [];
  }
}

// If we need to directly test this script
if (require.main === module) {
  // Example usage when run directly
  (async () => {
    try {
      const results = await fetchSpaniProducts('Arroz 5kg');
      console.log('Results:', JSON.stringify(results, null, 2));
    } catch (err) {
      console.error('Error:', err);
    }
    process.exit(0);
  })();
}

module.exports = fetchSpaniProducts;