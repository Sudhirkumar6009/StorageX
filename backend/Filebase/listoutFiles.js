import express from 'express';
import dotenv from 'dotenv';
import {
  S3Client,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';

const router = express.Router();

dotenv.config({ path: './.env' });

const s3 = new S3Client({
  endpoint: `${process.env.FILEBASE_ENDPOINT}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: `${process.env.FILEBASE_ACCESS_KEY}`,
    secretAccessKey: `${process.env.FILEBASE_SECRET_KEY}`,
  },
});

router.get('/api/filebase/list-cids', async (req, res) => {
  try {
    const listCommand = new ListObjectsV2Command({ Bucket: 'storagex' });
    const listData = await s3.send(listCommand);
    const files = listData.Contents || [];

    // Fetch CID for each file using HeadObject
    const filesWithCid = await Promise.all(
      files.map(async (file) => {
        try {
          const headCommand = new HeadObjectCommand({
            Bucket: 'storagex',
            Key: file.Key,
          });
          const headData = await s3.send(headCommand);
          const cid = headData.Metadata?.cid || null;
          return {
            key: file.Key,
            cid,
            size: file.Size,
            lastModified: file.LastModified,
          };
        } catch (err) {
          return {
            key: file.Key,
            cid: null,
            size: file.Size,
            lastModified: file.LastModified,
            error: err.message,
          };
        }
      })
    );

    res.json({ success: true, files: filesWithCid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;