import express from 'express';
import dotenv from 'dotenv';
import {
  S3Client,
  ListBucketsCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';

const router = express.Router();

dotenv.config({ path: './.env' });

const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: process.env.FILEBASE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.FILEBASE_ACCESS_KEY,
    secretAccessKey: process.env.FILEBASE_SECRET_KEY,
  },
});

// List all buckets
router.get('/api/filebase/list-buckets', async (req, res) => {
  try {
    const command = new ListBucketsCommand({});
    const { Buckets } = await s3.send(command);
    
    if (!Buckets) {
      return res.json({ success: true, buckets: [] });
    }
    
    const bucketNames = Buckets.map(bucket => bucket.Name);
    res.json({ success: true, buckets: bucketNames });
  } catch (err) {
    console.error('Error listing buckets:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create new bucket
router.post('/api/filebase/create-bucket', async (req, res) => {
  const { name } = req.body;
  
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Bucket name is required' 
    });
  }
  
  try {
    // Check if bucket already exists
    try {
      const headCommand = new HeadBucketCommand({ Bucket: name });
      await s3.send(headCommand);
      return res.status(400).json({
        success: false,
        error: 'Bucket already exists'
      });
    } catch (error) {
      // If we get an error, the bucket doesn't exist, which is what we want
      if (error.name !== 'NotFound') {
        throw error;
      }
    }
    
    const command = new CreateBucketCommand({ Bucket: name });
    await s3.send(command);
    
    res.json({ success: true, message: `Bucket "${name}" created successfully` });
  } catch (err) {
    console.error('Error creating bucket:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;