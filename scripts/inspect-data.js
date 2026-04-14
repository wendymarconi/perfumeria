const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DIRECT_URL,
});

async function main() {
  await client.connect();
  try {
    const res = await client.query('SELECT name, "mainImage" FROM "Perfume" LIMIT 1');
    if (res.rows.length > 0) {
      const p = res.rows[0];
      console.log('Product Name:', p.name);
      console.log('Main Image (First 100 chars):', p.mainImage.substring(0, 100));
      console.log('Main Image Length:', p.mainImage.length);
    } else {
      console.log('No perfumes found.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
