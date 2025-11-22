// testMongo.js
const { MongoClient } = require('mongodb');

async function main() {
  const client = await MongoClient.connect('mongodb://localhost:27017');
  console.log('✅ Connected to MongoDB!');
  await client.close();
}

main().catch(err => console.error('❌ Error:', err));
