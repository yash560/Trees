// lib/mongodb.js
import { MongoClient } from 'mongodb';

let uri = process.env.MONGODB_URI;
let dbName = process.env.MONGODB_DB;

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const client = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const db = client.db(dbName);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
}
