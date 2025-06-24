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

router.post("/api/fetch_cids", async (req, res) => {
  try {
    await client.connect();
    const { Wallet } = req.body;

    if (!Wallet) {
      return res.json({
        success: false,
        message: "MetaMask address is required",
      });
    }

    const db = client.db("Accounts");
    const addressesCollection = db.collection("WalletUsers");
    const user = await addressesCollection.findOne({ Wallet });

    if (!user) {
      return res.json({
        success: false,
        message: "No user found for this Wallet address",
      });
    }

    let cids = [];
    if (Array.isArray(user.storage)) {
      cids = user.storage;
    } else if (typeof user.storage === "object" && user.storage !== null) {
      cids = Object.values(user.storage);
    }

    res.json({ success: true, cids });
  } catch (error) {
    console.error("Fetch CIDs Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------------------------------------------------------------

router.post("/api/google/fetch_cids", async (req, res) => {
  try {
    await client.connect();
    const { email } = req.body;

    if (!email) {
      return res.json({
        success: false,
        message: "Google address is required",
      });
    }

    const db = client.db("Accounts");
    const addressesCollection = db.collection("EmailUsers");
    const user = await addressesCollection.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "No user found for this Google address",
      });
    }

    let cids = [];
    if (Array.isArray(user.storage)) {
      cids = user.storage;
    } else if (typeof user.storage === "object" && user.storage !== null) {
      cids = Object.values(user.storage);
    }

    res.json({ success: true, cids });
  } catch (error) {
    console.error("Fetch CIDs Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
export default router;
