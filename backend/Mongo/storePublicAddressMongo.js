import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });
const router = express.Router();

const client = new MongoClient(process.env.ATLAS_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

router.post("/api/store-address", async (req, res) => {
  try {
    await client.connect();

    let { email, Wallet } = req.body;
    if (!Wallet) {
      return res.json({
        success: false,
        message: "Wallet address is required",
      });
    }

    // Normalize address to lowercase
    Wallet = Wallet.toUpperCase();

    const db = client.db("Accounts");
    const addressesCollection = db.collection("WalletUsers");

    // Always check with lowercase
    const existingMetaMask = await addressesCollection.findOne({ Wallet });
    if (existingMetaMask) {
      return res.json({
        success: false,
        exists: true,
        message: "Account already exists with this Wallet address",
      });
    }

    const newDoc = {
      email: email || "Not Provided",
      Wallet,
      updatedAt: new Date(),
      storage: [],
    };

    const result = await addressesCollection.insertOne(newDoc);

    res.json({
      success: true,
      data: result,
      message: "Address stored successfully",
    });
  } catch (error) {
    console.error("Store Address Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
