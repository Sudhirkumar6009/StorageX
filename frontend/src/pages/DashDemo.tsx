// deleteFileFromFilebase.js
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Configure Filebase S3 client
const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: 'https://s3.filebase.com',
  credentials: {
    accessKeyId: 'ECB555DC44B4E49E1516',
    secretAccessKey: 'CxS5o9o8p2VaP5cn44PYffp6TvDAkVgrwyEMhSB1',
  },
});

// Function to delete a file from a Filebase bucket
export const deleteFile = async (bucketName, fileName) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });

    const response = await s3.send(command);
    console.log(`✅ File "${fileName}" deleted successfully.`);
    return response;
  } catch (error) {
    console.error(`❌ Error deleting "${fileName}":`, error);
    throw error;
  }
};
