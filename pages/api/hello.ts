// pages/api/tree.js

import { connectToDatabase } from "@/lib/mongo";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === 'GET') {
    const trees = await db.collection('trees').find({}).toArray();
    res.status(200).json(trees);
  } else if (req.method === 'POST') {
    const { tree } = req.body;
    const result = await db.collection('trees').insertOne(tree);
    res.status(201).json(result);
  } else if (req.method === 'PUT') {
    const { tree } = req.body;
    await db.collection('trees').updateOne(
      { name: tree.name },
      { $set: tree },
      { upsert: true }
    );
    res.status(200).json({ message: 'Tree updated' });
  }
}
