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

router.post("/api/googleAccount", async (req, res) => {
  try {
    await client.connect();

    const { email } = req.body;
    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    const db = client.db("Accounts");
    const addressesCollection = db.collection("EmailUsers");

    let user = await addressesCollection.findOne({ email });
    if (!user) {
      const newDoc = {
        email,
        updatedAt: new Date(),
        storage: [],
      };
      await addressesCollection.insertOne(newDoc);
      user = newDoc;
    }

    res.json({
      success: true,
      user,
      message: user ? "Logged in successfully" : "Account created successfully",
    });
  } catch (error) {
    console.error("Store Google User Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
