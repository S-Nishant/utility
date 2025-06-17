// step 1 - download csv and put it in the root, change name in the line 8 accordingly
//step 2 - run node generateSitemap.js
//step 3 - copy urls and paste in the main sitemap.xml file. update/replace/delete according to the instructions
//test

const fs = require('fs');
const path = require('path');

// Update these as needed:
const inputFilePath = path.join(__dirname, 'urls.csv'); // your exported CSV
const outputFilePath = path.join(__dirname, 'NewSitemap.xml');
const lastModDate = '2024-12-02'; // adjust as needed

// Read URLs from CSV (one URL per line)
const urls = fs.readFileSync(inputFilePath, 'utf8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0);

// Build the XML sitemap
let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
sitemapContent += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

urls.forEach((url) => {
  sitemapContent += `  <url>\n`;
  sitemapContent += `    <loc>${url}</loc>\n`;
  sitemapContent += `    <lastmod>${lastModDate}</lastmod>\n`;
  sitemapContent += `  </url>\n`;
});

sitemapContent += `</urlset>`;

fs.writeFileSync(outputFilePath, sitemapContent, 'utf8');
console.log('Sitemap generated at', outputFilePath);
