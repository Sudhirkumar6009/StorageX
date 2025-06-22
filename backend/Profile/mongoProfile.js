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
    const { name, email, walletAddress, profileImage } = req.body;

    const db = client.db("Profile");
    const profilesCollection = db.collection("EmailUsersProfile");

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

// Add better error handling for the profile endpoint
router.get("/api/profile/show/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    await client.connect();
    const db = client.db("Users");
    const profilesCollection = db.collection("Profile");

    const result = await profilesCollection.findOne({ walletAddress });

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

export default router;
