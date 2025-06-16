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

router.post('/api/store-address', async (req, res) => {
  try {
    await client.connect();

    const { email, MetaMask, public: publicData } = req.body;
    const db = client.db('Users');
    const addressesCollection = db.collection('Accounts');

    // Only MetaMask is unique
    if (!MetaMask) {
      return res.json({
        success: false,
        message: 'MetaMask address is required',
      });
    }

    // Block if MetaMask address exists in any document
    const existingMetaMask = await addressesCollection.findOne({ MetaMask });
    if (existingMetaMask) {
      return res.json({
        success: false,
        exists: true,
        message: 'Account already exists with this MetaMask address',
      });
    }

    // Create new document with public key
    const newDoc = {
      email: email || 'Not Provided',
      MetaMask,
      public: publicData, // always store public key
      updatedAt: new Date(),
      storage: {},
    };

    const result = await addressesCollection.insertOne(newDoc);

    res.json({
      success: true,
      data: result,
      message: 'Address stored successfully',
    });
  } catch (error) {
    console.error('Store Address Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
