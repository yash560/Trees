import { MongoClient, Db } from 'mongodb';

const uri: string = process.env.MONGO_URI || '';
const dbName: string = 'test';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
}
