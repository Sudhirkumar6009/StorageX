import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
dotenv.config({ path: "./.env" });

const router = express.Router();
const client = new MongoClient(process.env.ATLAS_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: process.env.FILEBASE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.FILEBASE_ACCESS_KEY,
    secretAccessKey: process.env.FILEBASE_SECRET_KEY,
  },
});

router.post("/api/filebase/delete", async (req, res) => {
  const { Wallet, cid, fileName } = req.body;

  if (!Wallet) {
    return res.status(400).json({
      success: false,
      message: "Wallet is required",
    });
  } else if (!cid) {
    return res.status(400).json({
      success: false,
      message: "cid is required",
    });
  } else if (!fileName) {
    return res.status(400).json({
      success: false,
      message: "fileName are required",
    });
  }

  try {
    await client.connect();
    const db = client.db("Accounts");
    const accounts = db.collection("WalletUsers");

    // Find user and verify the CID exists in their storage (array of strings)
    const user = await accounts.findOne({ Wallet: Wallet });
    if (!user || !Array.isArray(user.storage)) {
      return res.status(404).json({
        success: false,
        message: "User not found or invalid storage format",
      });
    }

    // Check if the cid exists in the user's storage array
    if (!user.storage.includes(cid)) {
      return res.status(404).json({
        success: false,
        message: "File with given CID not found in user storage",
      });
    }

    // Remove from Filebase using file name as key
    const command = new DeleteObjectCommand({
      Bucket: process.env.FILEBASE_BUCKET,
      Key: fileName,
    });

    try {
      const s3Response = await s3.send(command);
      console.log(
        `Filebase: Deleted "${fileName}" for CID: ${cid}`,
        s3Response
      );
    } catch (s3Err) {
      console.error("Error deleting from Filebase:", s3Err);
      return res.status(500).json({
        success: false,
        message: "Failed to delete file from Filebase",
        error: s3Err.message,
      });
    }

    // Remove the cid from user's storage in MongoDB
    const updatedStorage = user.storage.filter((item) => item !== cid);
    await accounts.updateOne(
      { Wallet: Wallet },
      { $set: { storage: updatedStorage } }
    );

    return res.json({
      success: true,
      message: "File deleted successfully",
      cid,
      fileName,
    });
  } catch (err) {
    console.error("Error during file delete:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  } finally {
    await client
      .close()
      .catch((e) => console.error("Error closing MongoDB:", e));
  }
});

// ---------------------------------------------------------------------------------------------------------------------------------

router.post("/api/filebase/google/delete", async (req, res) => {
  const { email, cid, fileName } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  } else if (!cid) {
    return res.status(400).json({
      success: false,
      message: "cid is required",
    });
  } else if (!fileName) {
    return res.status(400).json({
      success: false,
      message: "fileName are required",
    });
  }

  try {
    await client.connect();
    const db = client.db("Accounts");
    const accounts = db.collection("EmailUsers");

    const user = await accounts.findOne({ email: email });
    if (!user || !Array.isArray(user.storage)) {
      return res.status(404).json({
        success: false,
        message: "User not found or invalid storage format",
      });
    }

    if (!user.storage.includes(cid)) {
      return res.status(404).json({
        success: false,
        message: "File with given CID not found in user storage",
      });
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.FILEBASE_BUCKET,
      Key: fileName,
    });

    try {
      const s3Response = await s3.send(command);
      console.log(
        `Filebase: Deleted "${fileName}" for CID: ${cid}`,
        s3Response
      );
    } catch (s3Err) {
      console.error("Error deleting from Filebase:", s3Err);
      return res.status(500).json({
        success: false,
        message: "Failed to delete file from Filebase",
        error: s3Err.message,
      });
    }

    const updatedStorage = user.storage.filter((item) => item !== cid);
    await accounts.updateOne(
      { email: email },
      { $set: { storage: updatedStorage } }
    );

    return res.json({
      success: true,
      message: "File deleted successfully",
      cid,
      fileName,
    });
  } catch (err) {
    console.error("Error during file delete:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  } finally {
    await client
      .close()
      .catch((e) => console.error("Error closing MongoDB:", e));
  }
});

export default router;
