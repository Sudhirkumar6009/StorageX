const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
<<<<<<< HEAD
require('dotenv').config({ path: './.env' });
=======
require('dotenv').config({ path: './config.env' });
>>>>>>> 4f318936bc4036cc549beaaadfa0a624c639d73c
const { encrypt, decrypt } = require('./cryptoUtils');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.ATLAS_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get('/api/mongo/test', async (req, res) => {
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
  } finally {
    await client.close();
  }
});

app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`Backend server running on ${process.env.BACKEND_PORT_URL}`);
=======
  console.log(`Backend server running on http://localhost:${PORT}`);
>>>>>>> 4f318936bc4036cc549beaaadfa0a624c639d73c
});

app.post('/api/profile/update', async (req, res) => {
  try {
    await client.connect();
    const { name, email, walletAddress, profileImage } = req.body;

    const db = client.db('Users');
    const profilesCollection = db.collection('Profile');

    const encryptedData = {
      name: encrypt(name),
      email: encrypt(email),
      profileImage: encrypt(profileImage),
      updatedAt: new Date(),
    };

    const result = await profilesCollection.updateOne(
      { walletAddress: walletAddress },
      { $set: encryptedData },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Encrypted profile stored successfully',
      data: result,
    });
  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    await client.close();
  }
});

// Add better error handling for the profile endpoint
app.get('/api/profile/show/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required',
      });
    }

    await client.connect();
    const db = client.db('Users');
    const profilesCollection = db.collection('Profile');

    const result = await profilesCollection.findOne({ walletAddress });

    if (result) {
      const decrypted = {
        name: result.name ? decrypt(result.name) : '',
        email: result.email ? decrypt(result.email) : '',
        profileImage: result.profileImage ? decrypt(result.profileImage) : null,
      };

      res.json({
        success: true,
        data: decrypted,
      });
    } else {
      res.json({
        success: true,
        data: {
          name: '',
          email: '',
          profileImage: null,
        },
      });
    }
  } catch (error) {
    console.error('Profile Fetch Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    await client.close();
  }
});
