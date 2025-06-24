import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { encrypt, decrypt } from "../cryptoUtils.js";

const router = express.Router();
const client = new MongoClient(process.env.ATLAS_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

router.post("/api/profile/update", async (req, res) => {
  try {
    await client.connect();
    const { name, email, address, profileImage } = req.body;

    const db = client.db("Profile");
    const profilesCollection = db.collection("WalletUsersProfile");

    const encryptedData = {
      name: encrypt(name),
      email: encrypt(email),
      profileImage: encrypt(profileImage),
      updatedAt: new Date(),
    };
    const result = await profilesCollection.updateOne(
      { Wallet: address },
      { $set: encryptedData },
      { upsert: true }
    );

    res.json({
      success: true,
      message: "Encrypted profile stored successfully",
      data: result,
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/api/profile/show/:walletAddress", async (req, res) => {
  try {
    let { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    walletAddress = walletAddress.toUpperCase(); // Always uppercase

    await client.connect();
    const db = client.db("Profile");
    const profilesCollection = db.collection("WalletUsersProfile");

    // FIX: Use Wallet as the key, not walletAddress
    const result = await profilesCollection.findOne({ Wallet: walletAddress });

    if (result) {
      const decrypted = {
        name: result.name ? decrypt(result.name) : "",
        email: result.email ? decrypt(result.email) : "",
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
          name: "",
          email: "",
          profileImage: null,
        },
      });
    }
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/api/profile/google/update", async (req, res) => {
  try {
    await client.connect();
    const { name, email, profileImage } = req.body;

    const db = client.db("Profile");
    const profilesCollection = db.collection("EmailUsersProfile");

    const encryptedData = {
      name: encrypt(name),
      profileImage: encrypt(profileImage),
      updatedAt: new Date(),
    };
    const result = await profilesCollection.updateOne(
      { email },
      { $set: encryptedData },
      { upsert: true }
    );

    res.json({
      success: true,
      message: "Encrypted profile stored successfully",
      data: result,
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/api/profile/show/google/:email", async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google Email is required",
      });
    }

    await client.connect();
    const db = client.db("Profile");
    const profilesCollection = db.collection("EmailUsersProfile");

    const result = await profilesCollection.findOne({ email });

    if (result) {
      const decrypted = {
        name: result.name ? decrypt(result.name) : "",
        email,
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
          name: "",
          email: "",
          profileImage: null,
        },
      });
    }
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
