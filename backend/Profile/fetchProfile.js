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

router.post("/api/fetchUser", async (req, res) => {
  const { address } = req.body;
  await client.connect();
  const db = client.db("Accounts");
  const Collection = db.collection("WalletUsers");
  const user = await Collection.findOne({ Wallet: address });
  if (user) {
    return res.json({ success: true, profile: user });
  } else {
    return res.json({ success: false });
  }
});

export default router;
