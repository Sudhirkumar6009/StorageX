import express from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';

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

router.post('/api/filebase/list', async (req, res) => {
  const { metaMask } = req.body;
  if (!metaMask) {
    return res
      .status(400)
      .json({ success: false, message: 'metaMask required' });
  }

  try {
    await client.connect();
    const db = client.db('Users');
    const accounts = db.collection('Accounts');
    const user = await accounts.findOne({ MetaMask: metaMask });
    const storage = user?.storage || [];

    const files = await Promise.all(
      storage.map(async ({ cid }) => {
        let size = 'Unknown';
        let format = 'Unknown';
        let name = 'unknown';

        try {
          const headRes = await axios.head(
            `https://ipfs.filebase.io/ipfs/${cid}`
          );

          // File Size
          const contentLength = headRes.headers['content-length'];
          if (contentLength) {
            const kb = Number(contentLength) / 1024;
            size =
              kb > 1024
                ? `${(kb / 1024).toFixed(2)} MB`
                : `${kb.toFixed(2)} KB`;
          }

          // File Format
          const contentType = headRes.headers['content-type'];
          if (contentType) {
            const parts = contentType.split('/');
            format = parts[1] || 'Unknown';
          }

          // Filename from Content-Disposition
          const disposition = headRes.headers['content-disposition'];
          const match = disposition && /filename="(.+?)"/.exec(disposition);
          if (match) {
            name = match[1];
          }

          console.log(`📄 File: ${name}`);
          console.log(`📦 Size: ${size}`);
          console.log(`📂 Format: .${format}`);
        } catch (err) {
          console.warn(
            `⚠️ Failed to fetch metadata for CID ${cid}: ${err.message}`
          );
        }

        return {
          cid,
          name,
          size,
          format,
          preview: `https://cooperative-salmon-galliform.myfilebase.com/ipfs/${cid}`,
        };
      })
    );

    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
