const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { parse } = require('csv-parse/sync');
const { Client } = require('pg');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');
// Configuration
const outputDir = './sitemap-bifurcated';

const today = new Date();
const lastModDate = today.toISOString().split('T')[0];
const domain = 'https://www.hellocondo.com/';

const MAX_URLS = 5000;
const builder = new XMLBuilder({ ignoreAttributes: false, format: true });

// Output directory
const outputDirectory = path.join(__dirname, 'output');

if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}

// Wrap top-level awaits
(async () => {
  await fetchUrlsInBatches();
})();

async function fetchUrlsInBatches(batchSize = 5000) {
  const client = new Client({
    user: 'hellocondo_prod',
    host: 'localhost',
    database: 'hellocondo_prod',
    password: 'hellocondo_prod@123',
    port: 55432, // default PostgreSQL port
  });
  await client.connect();
  let offset = 0;
  let batchNumber = 1;
  let fileNumber = 0;
  const sitemapFiles = [];
  while (true) {
    const query = `SELECT 
   CONCAT(
        'https://www.hellocondo.com/', 
        REPLACE(LOWER(np.city), ' ', '-'), '-',
        LOWER(np.state), 
        '/n/', 
        LOWER(np.slug)
    ) AS url
FROM 
    niche_pages np 
WHERE 
    np.days_on_market is not null and np.market_insights_tip is not null LIMIT $1 OFFSET $2 `;

    try {
      const result = await client.query(query, [batchSize, offset]);
      const rows = result.rows;
      if (rows.length === 0) {
        console.log('All records fetched.');
        break;
      }

      console.log(`Batch ${batchNumber}: Retrieved ${rows.length} URLs`);

      // rows.forEach((row,i) => {
      //   console.log(row.url); // Or store/process the URL as needed
      // });
      for (let i = 0; i < rows.length; i += MAX_URLS) {
        const chunk = rows.slice(i, i + MAX_URLS).map(row => ({
          loc: row.url,
          lastmod: lastModDate, // or new Date().toISOString()
        }));
        const chunkXml = builder.build({
          urlset: {
            '@_xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
            url: chunk,
          }
        });
        const fileName = `sitemap-niche${fileNumber + 1}.xml`;
        fs.writeFileSync(path.join(outputDir, fileName), chunkXml);
        sitemapFiles.push(fileName);
        fileNumber++;
      }
      
    const sitemapIndexXml = builder.build({
      sitemapindex: {
        '@_xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
        sitemap: sitemapFiles.map(file => ({
          loc: `${domain}sitemaps/${file}`,
          lastmod: new Date().toISOString(),
        })),
      }
    });
      fs.writeFileSync(path.join(outputDir, 'sitemap_index.xml'), sitemapIndexXml);
      console.log(sitemapFiles)
      offset += batchSize;
      batchNumber++;
    } catch (error) {
      console.error('Error executing query:', error);
      break;
    }
  }

  await client.end();
}