const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { parse } = require('csv-parse/sync');

// Configuration
const csvDirPath = path.join(__dirname, 'csv-directory'); // Directory holding all CSVs
const today = new Date();
const lastModDate = today.toISOString().split('T')[0]; // Current date
const domain = 'https://www.hellocondo.com'; // Base domain to strip out

//Output directory
const outputDirectory = path.join(__dirname, 'output');

// Ensure the output directory exists
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}

//Set output file names
const outputSitemap = path.join(outputDirectory, 'finalsitemap.xml');
const outputRobots = path.join(outputDirectory, 'finalrobots.txt');
const outputTSX = path.join(outputDirectory, 'indexedBuildings.js');

// Function to test if URL is live
async function isUrlLive(url) {
  try {
    const response = await axios.head(url, { timeout: 5000 });
    return response.status < 400;
  } catch (error) {
    return false;
  }
}

(async () => {
  // Get all CSV files from the directory
  const allFiles = fs.readdirSync(csvDirPath);
  const csvFiles = allFiles.filter(file => file.toLowerCase().endsWith('.csv'));

  if (csvFiles.length === 0) {
    console.error('No CSV files found in the directory:', csvDirPath);
    process.exit(1);
  }

  // Read URLs from all CSV files
  let allUrls = [];
  for (const csvFile of csvFiles) {
    const filePath = path.join(csvDirPath, csvFile);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    // const urls = fileContent
    //   .split('\n')
    //   .map(line => line.trim())
    //   .filter(line => line.length > 0);
    // allUrls.push(...urls);

    const records = parse(fileContent, {
      trim: true,
      skip_empty_lines: true,
      // from_line: 2 // skip first header row (contains first column header not the url)
    });
    if(!records[0][0].startsWith('https://')){
      showError(records);
      return;
    }

    for (const row of records) {
      for (const value of row) {
        //Encode last part of url to generate working urls
        const lastSlashIndex = value.lastIndexOf('/');
        const base = value.substring(0, lastSlashIndex + 1);
        const lastPart = value.substring(lastSlashIndex + 1);
        allUrls.push(base + encodeURIComponent(lastPart));
      }
    }
  }

  // Remove duplicates if any
  const FinalUrlSet = Array.from(new Set(allUrls));

  //START---------Console box for stats - START
  const totalCsvUrls = allUrls.length;
  const deduplicatedUrls = FinalUrlSet.length;
  const duplicates = totalCsvUrls - deduplicatedUrls;
  
  const lines = [
    `CSV URLs Count      : ${totalCsvUrls}`,
    `Duplicate URLs Count: ${duplicates}`,
    `Final Unique URLs   : ${deduplicatedUrls}`,
  ];
  
  const maxLength = Math.max(...lines.map(line => line.length));
  const horizontalBorder = '─'.repeat(maxLength + 2);
  
  console.log(`┌${horizontalBorder}┐`);
  lines.forEach(line => {
    const padding = ' '.repeat(maxLength - line.length);
    console.log(`│ ${line}${padding} │`);
  });
  console.log(`└${horizontalBorder}┘`);
  //Console box for stats -----------END


  // const liveUrls = [];
  // for (const url of FinalUrlSet) {
  //   liveUrls.push(url);
  //   process.stdout.write(`Checking: ${url} ... `);
  //   const live = await isUrlLive(url);
  //   if (live) {
  //     console.log('OK');
  //     liveUrls.push(url);
  //   } else {
  //     console.log('NOT OK (excluded)');
  //   }
  // }

  // Generate sitemap.xml
  let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemapContent += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (let url of FinalUrlSet) {
    sitemapContent += `  <url>\n`;
    sitemapContent += `    <loc>${url}</loc>\n`;
    sitemapContent += `    <lastmod>${lastModDate}</lastmod>\n`;
    sitemapContent += `  </url>\n`;
  }
  sitemapContent += `</urlset>`;
  fs.writeFileSync(outputSitemap, sitemapContent, 'utf8');

  // Generate robots.txt and indexedBuildings.tsx
  const buildingPaths = FinalUrlSet.map(url => {
    // Remove domain from the URL to get path
    const pathPart = url.replace(domain, '');
    return pathPart; 
  });

  // robots.txt
  let robotsContent = `User-agent: *\nDisallow: /\n`;
  for (const bPath of buildingPaths) {
    robotsContent += `Allow: ${bPath}\n`;
  }
  fs.writeFileSync(outputRobots, robotsContent, 'utf8');

  // indexedBuildings.tsx
  const indexedBuildingsArray = buildingPaths.map(p => p.startsWith('/') ? p.slice(1) : p);
  const tsxContent = `export const indexedBuildings = [\n` + 
    indexedBuildingsArray.map(p => `  "${p}",`).join('\n') + 
  `\n];\n`;
  
  fs.writeFileSync(outputTSX, tsxContent, 'utf8');

  //START-----------Console box for Output
  const messages = [
    { label: 'Sitemap generated at', value: outputSitemap },
    { label: 'robots.txt generated at', value: outputRobots },
    { label: 'indexedBuildings.tsx generated at', value: outputTSX },
  ];

  const maxLabelLength = Math.max(...messages.map(m => m.label.length));
  const maxValueLength = Math.max(...messages.map(m => m.value.length));
  const totalWidth = maxLabelLength + maxValueLength + 3; // spacing and colon
  const horizontal = '─'.repeat(totalWidth);

  console.log(`\n┌${horizontal}`);
  messages.forEach(({ label, value }) => {
    const labelPad = ' '.repeat(maxLabelLength - label.length);
    const valuePad = ' '.repeat(maxValueLength - value.length);
    console.log(`│ ${label}${labelPad} : ${value}${valuePad}`);
  });
  console.log(`└${horizontal}\n`);
  //Console box for Output -----------END
})();


function showError(records)  {
  const msg = "ERROR: Data in the first row does not contain 'https://'";
  const row = `First row data : "${records[0][0]}"`;

  // Create the box
  const lines = [msg, row];
  const maxLength = Math.max(...lines.map(line => line.length));
  const horizontalBorder = '─'.repeat(maxLength + 2);

  // ANSI escape codes for red text
  const red = '\x1b[31m';
  const reset = '\x1b[0m';

  console.log(red + `┌${horizontalBorder}┐`);
  lines.forEach(line => {
    const padding = ' '.repeat(maxLength - line.length);
    console.log(`│ ${line}${padding} │`);
  });
  console.log(`└${horizontalBorder}┘` + reset);
}