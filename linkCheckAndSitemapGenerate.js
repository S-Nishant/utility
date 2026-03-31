// step 1 - download csv and put it in the root, change name in the line 8 accordingly
//step 2 - run node linkCheckAndSitemapGenerate.js
//step 3 - copy urls and paste in the main sitemap.xml file. update/replace/delete according to the instructions
//test


const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const inputFilePath = path.join(__dirname, 'urls.csv');
const outputFilePath = path.join(__dirname, 'sitemapWithLinkChecked.xml');
const lastModDate = '2024-12-02'; // Update this if needed

// Read the URLs from the CSV file
const allUrls = fs.readFileSync(inputFilePath, 'utf8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0);

// Function to check URL status
async function isUrlLive(url) {
  try {
    // HEAD request is often faster to just check if the page is accessible
    const response = await axios.head(url, { timeout: 5000 });
    // If we got a 2xx or 3xx response, assume URL is live
    return response.status < 400;
  } catch (error) {
    // If an error occurs or the status code is not successful, consider it offline
    return false;
  }
}

(async () => {
  const liveUrls = [];

  // Check each URL
  for (const url of allUrls) {
    process.stdout.write(`Checking: ${url} ... `);
    const live = await isUrlLive(url);
    if (live) {
      console.log('OK');
      liveUrls.push(url);
    } else {
      console.log('NOT OK (excluded)');
    }
  }

  // Build the XML sitemap
  let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemapContent += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  liveUrls.forEach((url) => {
    sitemapContent += `  <url>\n`;
    sitemapContent += `    <loc>${url}</loc>\n`;
    sitemapContent += `    <lastmod>${lastModDate}</lastmod>\n`;
    sitemapContent += `  </url>\n`;
  });

  sitemapContent += `</urlset>`;

  fs.writeFileSync(outputFilePath, sitemapContent, 'utf8');
  console.log(`Sitemap generated with ${liveUrls.length} URLs at ${outputFilePath}`);
})();
