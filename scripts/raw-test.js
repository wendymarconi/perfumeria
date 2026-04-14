const { Client } = require('pg');
require('dotenv').config();

// Use DIRECT_URL for test
const connectionString = process.env.DIRECT_URL;

const client = new Client({
  connectionString: connectionString,
});

async function main() {
  console.log('--- RAW DB CONNECTION TEST ---');
  try {
    await client.connect();
    console.log('Connected successfully!');
    
    const res = await client.query('SELECT pg_size_pretty(pg_database_size(current_database())) as size');
    console.log('Database Size:', res.rows[0].size);
    
    const perfumes = await client.query('SELECT name, length("mainImage") as img_size FROM "Perfume" LIMIT 5');
    console.log('Perfumes sample:');
    perfumes.rows.forEach(row => console.log(`- ${row.name}: ${Math.round(row.img_size/1024)} KB`));
    
  } catch (err) {
    console.error('CONNECTION ERROR DETAILS:');
    console.error('Message:', err.message);
    console.error('Code:', err.code);
    console.error('Detail:', err.detail);
    console.error('Hint:', err.hint);
  } finally {
    await client.end();
  }
}

main();
