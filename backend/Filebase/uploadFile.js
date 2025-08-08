import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
import multer from "multer";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

dotenv.config({ path: "./.env" });

const router = express.Router();
const upload = multer();
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

router.post("/api/filebase/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  const { wallet } = req.body;
  if (!file || !wallet) {
    return res
      .status(400)
      .json({ success: false, message: "File and Wallet Connection required" });
  }
  try {
    console.log("Uploading file:", file.originalname);
    const putCommand = new PutObjectCommand({
      Bucket: process.env.FILEBASE_BUCKET,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await s3.send(putCommand);

    // Add the same delay as in your Google upload route
    console.log("Waiting 5 seconds for Filebase to process...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const headCommand = new HeadObjectCommand({
      Bucket: process.env.FILEBASE_BUCKET,
      Key: file.originalname,
    });
    const headRes = await s3.send(headCommand);

    const cid = headRes.Metadata && headRes.Metadata["cid"];
    if (cid) {
      console.log("CID:", cid);
      await client.connect();
      const db = client.db("Accounts");
      const accounts = db.collection("WalletUsers");

      // First check if the document exists
      const existingDoc = await accounts.findOne({ Wallet: wallet });

      if (existingDoc) {
        // If storage array doesn't exist, create it
        if (!existingDoc.storage) {
          await accounts.updateOne(
            { Wallet: wallet },
            { $set: { storage: [cid] } }
          );
        } else {
          // If storage array exists, add to it
          await accounts.updateOne(
            { Wallet: wallet },
            { $addToSet: { storage: cid } }
          );
        }
      } else {
        // Create new document with storage array
        await accounts.insertOne({
          Wallet: wallet,
          email: "Not Provided",
          storage: [cid],
          updatedAt: new Date(),
        });
      }

      return res.json({ success: true, cid });
    } else {
      console.warn("No CID found in metadata.");
      return res
        .status(500)
        .json({ success: false, message: "No CID found in metadata." });
    }
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------------------------------------------------------------

router.post(
  "/api/filebase/google/upload",
  upload.single("file"),
  async (req, res) => {
    const file = req.file;
    const { email } = req.body;
    if (!file || !email) {
      return res
        .status(400)
        .json({ success: false, message: "File and Email required" });
    }
    try {
      console.log("Uploading file:", file.originalname);
      const putCommand = new PutObjectCommand({
        Bucket: process.env.FILEBASE_BUCKET,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
      });
      await s3.send(putCommand);

      console.log("Waiting 5 seconds for Filebase to process...");
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const headCommand = new HeadObjectCommand({
        Bucket: process.env.FILEBASE_BUCKET,
        Key: file.originalname,
      });
      const headRes = await s3.send(headCommand);

      const cid = headRes.Metadata && headRes.Metadata["cid"];
      if (cid) {
        console.log("CID:", cid);
        await client.connect();
        const db = client.db("Accounts");
        const accounts = db.collection("EmailUsers");
        await accounts.updateOne({ email: email }, { $push: { storage: cid } });
        return res.json({ success: true, cid });
      } else {
        console.warn("No CID found in metadata.");
        return res
          .status(500)
          .json({ success: false, message: "No CID found in metadata." });
      }
    } catch (err) {
      console.error("❌ Upload error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ---------------------------------------------------------------------------------------------------------------------------------

router.post("/api/filebase/upload-in-folder", upload.single("file"), async (req, res) => {
  const file = req.file;
  const { wallet, folderPath, relativePath } = req.body;
  
  if (!file || !wallet || !folderPath) {
    return res
      .status(400)
      .json({ success: false, message: "File, wallet and folder information required" });
  }
  
  try {
    // Use the relative path for the file key
    const fileKey = relativePath;
    
    console.log(`Uploading file to ${process.env.FILEBASE_BUCKET}/${fileKey}`);
    const putCommand = new PutObjectCommand({
      Bucket: process.env.FILEBASE_BUCKET,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await s3.send(putCommand);

    console.log("Waiting for Filebase to process...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const headCommand = new HeadObjectCommand({
      Bucket: process.env.FILEBASE_BUCKET,
      Key: fileKey,
    });
    const headRes = await s3.send(headCommand);

    const cid = headRes.Metadata && headRes.Metadata["cid"];
    if (cid) {
      console.log("CID:", cid);
      await client.connect();
      const db = client.db("Accounts");
      const accounts = db.collection("WalletUsers");
      
      // First check if the document exists
      const existingDoc = await accounts.findOne({ Wallet: wallet });

      if (existingDoc) {
        // If storage array doesn't exist, create it
        if (!existingDoc.storage) {
          await accounts.updateOne(
            { Wallet: wallet },
            { $set: { storage: [cid] } }
          );
        } else {
          // If storage array exists, add to it
          await accounts.updateOne(
            { Wallet: wallet },
            { $addToSet: { storage: cid } }
          );
        }
        
        // Also add file to folder metadata if needed
        if (existingDoc.folders) {
          const folderIndex = existingDoc.folders.findIndex(f => f.name === folderPath);
          if (folderIndex >= 0) {
            // Update folder files array
            const updatePath = `folders.${folderIndex}.files`;
            await accounts.updateOne(
              { Wallet: wallet },
              { $addToSet: { [updatePath]: { cid, name: fileKey.split('/').pop() } } }
            );
          }
        }
      } else {
        // Create new document with storage array
        await accounts.insertOne({
          Wallet: wallet,
          email: "Not Provided",
          storage: [cid],
          folders: [
            {
              name: folderPath,
              path: `${folderPath}/`,
              created: new Date(),
              files: [{ cid, name: fileKey.split('/').pop() }]
            }
          ],
          updatedAt: new Date(),
        });
      }

      return res.json({ success: true, cid });
    } else {
      console.warn("No CID found in metadata.");
      return res
        .status(500)
        .json({ success: false, message: "No CID found in metadata." });
    }
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Also add the Google version
router.post("/api/filebase/google/upload-in-folder", upload.single("file"), async (req, res) => {
  const file = req.file;
  const { email, folderPath, relativePath } = req.body;
  
  if (!file || !email || !folderPath) {
    return res
      .status(400)
      .json({ success: false, message: "File, email and folder information required" });
  }
  
  try {
    const fileKey = relativePath;
    
    console.log(`Uploading file to ${process.env.FILEBASE_BUCKET}/${fileKey}`);
    const putCommand = new PutObjectCommand({
      Bucket: process.env.FILEBASE_BUCKET,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await s3.send(putCommand);

    console.log("Waiting for Filebase to process...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const headCommand = new HeadObjectCommand({
      Bucket: process.env.FILEBASE_BUCKET,
      Key: fileKey,
    });
    const headRes = await s3.send(headCommand);

    const cid = headRes.Metadata && headRes.Metadata["cid"];
    if (cid) {
      console.log("CID:", cid);
      await client.connect();
      const db = client.db("Accounts");
      const accounts = db.collection("EmailUsers");
      
      // Update based on email
      const existingDoc = await accounts.findOne({ email });

      if (existingDoc) {
        if (!existingDoc.storage) {
          await accounts.updateOne(
            { email },
            { $set: { storage: [cid] } }
          );
        } else {
          await accounts.updateOne(
            { email },
            { $addToSet: { storage: cid } }
          );
        }
        
        // Add to folder metadata
        if (existingDoc.folders) {
          const folderIndex = existingDoc.folders.findIndex(f => f.name === folderPath);
          if (folderIndex >= 0) {
            const updatePath = `folders.${folderIndex}.files`;
            await accounts.updateOne(
              { email },
              { $addToSet: { [updatePath]: { cid, name: fileKey.split('/').pop() } } }
            );
          }
        }
      } else {
        await accounts.insertOne({
          email,
          storage: [cid],
          folders: [
            {
              name: folderPath,
              path: `${folderPath}/`,
              created: new Date(),
              files: [{ cid, name: fileKey.split('/').pop() }]
            }
          ],
          updatedAt: new Date(),
        });
      }

      return res.json({ success: true, cid });
    } else {
      console.warn("No CID found in metadata.");
      return res
        .status(500)
        .json({ success: false, message: "No CID found in metadata." });
    }
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
