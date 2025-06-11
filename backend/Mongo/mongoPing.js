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
router.get('/api/mongo/test', async (req, res) => {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });

    const result = {
      success: true,
      message: 'MongoDB Connected Successfully!',
      timestamp: new Date().toISOString(),
    };

    res.json(result);
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
