const { Client } = require('pg');
require('dotenv').config();

// Extraer la URL de Neon (aunque esté comentada en el env, el usuario me la pasó antes o puedo intentar parsear el archivo)
const neonUrl = "postgresql://neondb_owner:npg_v27UcbVazNJh@ep-lively-sunset-ad11vu2e-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const client = new Client({ connectionString: neonUrl });
  console.log('--- TESTING NEON CONNECTION ---');
  try {
    await client.connect();
    console.log('Connected to Neon successfully!');
    
    const res = await client.query('SELECT count(*) FROM "Perfume"');
    console.log(`Perfumes found in Neon: ${res.rows[0].count}`);
    
    const sample = await client.query('SELECT name, length("mainImage") as size FROM "Perfume" LIMIT 5');
    console.log('Sample from Neon:');
    sample.rows.forEach(r => console.log(`- ${r.name}: ${Math.round(r.size/1024)} KB`));

  } catch (err) {
    console.error('Neon Connection Error:', err.message);
  } finally {
    await client.end();
  }
}

main();
