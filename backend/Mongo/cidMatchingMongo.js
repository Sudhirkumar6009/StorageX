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

router.post('/api/fetch_cids', async (req, res) => {
  try {
    await client.connect();
    const { MetaMask } = req.body;

    if (!MetaMask) {
      return res.json({
        success: false,
        message: 'MetaMask address is required',
      });
    }

    const db = client.db('Users');
    const addressesCollection = db.collection('Accounts');
    const user = await addressesCollection.findOne({ MetaMask });

    if (!user) {
      return res.json({
        success: false,
        message: 'No user found for this MetaMask address',
      });
    }

    let cids = [];
    if (Array.isArray(user.storage)) {
      cids = user.storage;
    } else if (typeof user.storage === 'object' && user.storage !== null) {
      cids = Object.values(user.storage);
    }

    res.json({ success: true, cids });
  } catch (error) {
    console.error('Fetch CIDs Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
