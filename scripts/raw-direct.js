const { Client } = require('pg');
require('dotenv').config();

// Use DIRECT_URL for test
const connectionString = process.env.DIRECT_URL;

const client = new Client({
  connectionString: connectionString,
});

async function main() {
  console.log('--- RAW DIRECT CONNECTION TEST ---');
  try {
    await client.connect();
    console.log('Connected successfully to DIRECT_URL!');
    
    const res = await client.query('SELECT pg_size_pretty(pg_database_size(current_database())) as size');
    console.log('Database Size:', res.rows[0].size);
    
    const count = await client.query('SELECT count(*) FROM "Perfume"');
    console.log('Total Perfumes:', count.rows[0].count);
    
  } catch (err) {
    console.error('CONNECTION ERROR DETAILS:');
    console.error('Message:', err.message);
    console.error('Code:', err.code);
  } finally {
    await client.end();
  }
}

main();
