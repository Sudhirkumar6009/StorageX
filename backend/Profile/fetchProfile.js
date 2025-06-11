import express from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });
const router = express.Router();

const client = new MongoClient(process.env.ATLAS_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

router.post('/api/fetchUserProfile', async (req, res) => {
  const { address } = req.body;
  await client.connect();
  const db = client.db('Users');
  const Collection = db.collection('Accounts');
  const user = await Collection.findOne({ public: address });
  if (user) {
    return res.json({ success: true, profile: user });
  } else {
    return res.json({ success: false });
  }
});

export default router;
