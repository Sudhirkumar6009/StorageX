
import { create } from 'ipfs-http-client';

const projectId = 'your-infura-project-id'; // Replace with actual Infura project ID
const projectSecret = 'your-infura-project-secret'; // Replace with actual Infura project secret

const auth = 'Basic ' + btoa(projectId + ':' + projectSecret);

// For demo purposes, we'll use a public IPFS gateway
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

export interface IPFSFile {
  name: string;
  hash: string;
  size: number;
  url: string;
}

export const uploadToIPFS = async (file: File): Promise<IPFSFile> => {
  try {
    const added = await ipfs.add(file);
    const hash = added.cid.toString();
    const url = `https://ipfs.infura.io/ipfs/${hash}`;
    
    return {
      name: file.name,
      hash,
      size: file.size,
      url
    };
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
};

export const getFromIPFS = async (hash: string): Promise<string> => {
  try {
    const chunks = [];
    for await (const chunk of ipfs.cat(hash)) {
      chunks.push(chunk);
    }
    const data = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      data.set(chunk, offset);
      offset += chunk.length;
    }
    return new TextDecoder().decode(data);
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    throw new Error('Failed to retrieve file from IPFS');
  }
};
