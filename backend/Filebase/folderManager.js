import express from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3';

dotenv.config({ path: './.env' });

const router = express.Router();
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

// Create a new folder
router.post('/api/filebase/create-folder', async (req, res) => {
  const { wallet, folderName } = req.body;
  
  if (!wallet || !folderName) {
    return res.status(400).json({ 
      success: false, 
      error: 'Wallet and folder name are required' 
    });
  }
  
  try {
    // In S3, folders are represented as objects with trailing slash
    const folderKey = `${folderName}/`;
    
    // Create empty object with trailing slash to represent folder
    const command = new PutObjectCommand({
      Bucket: process.env.FILEBASE_BUCKET,
      Key: folderKey,
      Body: '',
    });
    
    await s3.send(command);
    
    // Store folder reference in MongoDB
    await client.connect();
    const db = client.db('Accounts');
    const collection = db.collection('WalletUsers');
    
    // Update the user document to include folder information
    await collection.updateOne(
      { Wallet: wallet },
      { 
        $addToSet: { 
          folders: {
            name: folderName,
            path: folderKey,
            created: new Date()
          } 
        } 
      },
      { upsert: true }
    );
    
    res.json({
      success: true,
      folder: {
        name: folderName,
        path: folderKey
      }
    });
  } catch (err) {
    console.error('Error creating folder:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await client.close();
  }
});

// Google version
router.post('/api/filebase/google/create-folder', async (req, res) => {
  const { email, folderName } = req.body;
  
  if (!email || !folderName) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email and folder name are required' 
    });
  }
  
  try {
    const folderKey = `${folderName}/`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.FILEBASE_BUCKET,
      Key: folderKey,
      Body: '',
    });
    
    await s3.send(command);
    
    await client.connect();
    const db = client.db('Accounts');
    const collection = db.collection('EmailUsers');
    
    await collection.updateOne(
      { email },
      { 
        $addToSet: { 
          folders: {
            name: folderName,
            path: folderKey,
            created: new Date()
          } 
        } 
      },
      { upsert: true }
    );
    
    res.json({
      success: true,
      folder: {
        name: folderName,
        path: folderKey
      }
    });
  } catch (err) {
    console.error('Error creating folder:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await client.close();
  }
});

// List folders for a user
router.post('/api/filebase/list-folders', async (req, res) => {
  const { wallet, email } = req.body;
  
  if (!wallet && !email) {
    return res.status(400).json({
      success: false,
      error: 'User identification required'
    });
  }
  
  try {
    await client.connect();
    const db = client.db('Accounts');
    const collection = wallet 
      ? db.collection('WalletUsers')
      : db.collection('EmailUsers');
    
    const query = wallet ? { Wallet: wallet } : { email };
    
    const user = await collection.findOne(query);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Get folders from user document
    const folders = user.folders || [];
    
    // For each folder, count files in S3
    const foldersWithFileCounts = await Promise.all(
      folders.map(async (folder) => {
        try {
          // List objects with folder prefix
          const command = new ListObjectsV2Command({
            Bucket: process.env.FILEBASE_BUCKET,
            Prefix: folder.path
          });
          
          const { Contents = [] } = await s3.send(command);
          
          // Filter out the folder object itself (ends with slash)
          const fileCount = Contents.filter(item => !item.Key.endsWith('/')).length;
          
          return {
            ...folder,
            files: fileCount
          };
        } catch (error) {
          console.error(`Error counting files in folder ${folder.name}:`, error);
          return {
            ...folder,
            files: 0
          };
        }
      })
    );
    
    res.json({
      success: true,
      folders: foldersWithFileCounts
    });
  } catch (err) {
    console.error('Error listing folders:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await client.close();
  }
});

// List files in a folder
router.post('/api/filebase/list-folder-contents', async (req, res) => {
  const { wallet, email, folderPath } = req.body;
  
  if ((!wallet && !email) || !folderPath) {
    return res.status(400).json({
      success: false,
      error: 'User identification and folder path required'
    });
  }
  
  try {
    // List objects with folder prefix
    const command = new ListObjectsV2Command({
      Bucket: process.env.FILEBASE_BUCKET,
      Prefix: `${folderPath}/`
    });
    
    const { Contents = [] } = await s3.send(command);
    
    // Filter out the folder object itself and map to file format
    const files = await Promise.all(
      Contents.filter(item => !item.Key.endsWith('/'))
        .map(async (file) => {
          try {
            return {
              key: file.Key,
              name: file.Key.split('/').pop(),
              size: file.Size,
              lastModified: file.LastModified,
              // You might want to add CID fetching here similar to your listoutFiles.js
              cid: file.Key // This would need to be replaced with actual CID from metadata
            };
          } catch (err) {
            return {
              key: file.Key,
              name: file.Key.split('/').pop(),
              size: file.Size,
              lastModified: file.LastModified,
              error: err.message
            };
          }
        })
    );
    
    res.json({
      success: true,
      folderPath,
      files
    });
  } catch (err) {
    console.error('Error listing folder contents:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;