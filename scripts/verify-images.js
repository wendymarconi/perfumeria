const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DIRECT_URL,
});

async function main() {
  await client.connect();
  console.log('--- DB IMAGE VERIFICATION ---');
  try {
    const res = await client.query('SELECT id, name, "mainImage", images FROM "Perfume"');
    console.log(`Total perfumes found: ${res.rows.length}`);
    
    res.rows.forEach(row => {
      console.log(`\nProduct: ${row.name}`);
      console.log(`Main Image Present: ${!!row.mainImage}`);
      console.log(`Main Image Length: ${row.mainImage?.length || 0}`);
      
      let imagesArray = [];
      try {
        imagesArray = JSON.parse(row.images || '[]');
      } catch (e) {}
      console.log(`Secondary Images Count: ${imagesArray.length}`);
      if (imagesArray.length > 0) {
        imagesArray.forEach((img, i) => {
            console.log(`  Image ${i} Length: ${img?.length || 0}`);
        });
      }
    });

    const carousel = await client.query('SELECT count(*) FROM "HomeCarousel"');
    console.log(`\nCarousel images count: ${carousel.rows[0].count}`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

main();
