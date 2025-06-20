import express from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import multer from 'multer';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';

dotenv.config({ path: './.env' });

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
  region: 'us-east-1',
  endpoint: process.env.FILEBASE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.FILEBASE_ACCESS_KEY,
    secretAccessKey: process.env.FILEBASE_SECRET_KEY,
  },
});

router.post('/api/filebase/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  const { metaMask } = req.body;
  if (!file || !metaMask) {
    return res
      .status(400)
      .json({ success: false, message: 'File and metaMask required' });
  }
  try {
    console.log('Uploading file:', file.originalname);
    const putCommand = new PutObjectCommand({
      Bucket: process.env.FILEBASE_BUCKET,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await s3.send(putCommand);

    const headCommand = new HeadObjectCommand({
      Bucket: process.env.FILEBASE_BUCKET,
      Key: file.originalname,
    });
    const headRes = await s3.send(headCommand);

    const cid = headRes.Metadata && headRes.Metadata['cid'];
    if (cid) {
      console.log('CID:', cid);
      await client.connect();
      const db = client.db('Users');
      const accounts = db.collection('Accounts');
      await accounts.updateOne(
        { MetaMask: metaMask },
        { $push: { storage: cid } }
      );
      return res.json({ success: true, cid });
    } else {
      console.warn('No CID found in metadata.');
      return res
        .status(500)
        .json({ success: false, message: 'No CID found in metadata.' });
    }
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});






// ---------------------------------------------------------------------------------------------------------------------------------





router.post('/api/filebase/google/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  const { email } = req.body;
  if (!file || !email) {
    return res
      .status(400)
      .json({ success: false, message: 'File and Email required' });
  }
  try {
    console.log('Uploading file:', file.originalname);
    const putCommand = new PutObjectCommand({
      Bucket: process.env.FILEBASE_BUCKET,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await s3.send(putCommand);

    console.log('Waiting 5 seconds for Filebase to process...');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const headCommand = new HeadObjectCommand({
      Bucket: process.env.FILEBASE_BUCKET,
      Key: file.originalname,
    });
    const headRes = await s3.send(headCommand);

    const cid = headRes.Metadata && headRes.Metadata['cid'];
    if (cid) {
      console.log('CID:', cid);
      await client.connect();
      const db = client.db('Accounts');
      const accounts = db.collection('EmailUsers');
      await accounts.updateOne(
        { email: email },
        { $push: { storage: cid } }
      );
      return res.json({ success: true, cid });
    } else {
      console.warn('No CID found in metadata.');
      return res
        .status(500)
        .json({ success: false, message: 'No CID found in metadata.' });
    }
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});


export default router;
