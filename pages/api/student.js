import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  try {
    const client = await MongoClient.connect(process.env.MONGO_URI);
    const db = client.db('mydb');
    const students = await db.collection('students').find().toArray();
    await client.close();

    res.status(200).json({ students });
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
}
