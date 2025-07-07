import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer'; // Add this import for browser compatibility

// List of IPFS gateways to try, starting with CORS-enabled ones
const IPFS_GATEWAYS = [
  'https://ipfs-w3auth.crustapps.io/api/v0', // CORS-enabled gateway (first priority)
  'https://gw.crustfiles.app/api/v0',
  'https://crustipfs.xyz/api/v0',
  'https://ipfs.filebase.io/api/v0',
];

const DashDemo: React.FC = () => {
  const [account, setAccount] = useState<string>('');
  const [files, setFiles] = useState<
    Array<{ cid: string; name: string; size: string; requestId: string }>
  >([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentGateway, setCurrentGateway] = useState<string>(
    IPFS_GATEWAYS[0]
  );

  // Connect MetaMask wallet
  const connectWallet = async () => {
    setError('');
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not detected. Please install MetaMask.');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      const address = accounts[0];
      setAccount(address);

      // Sign address for authentication
      await signAddress(address);
      return address;
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(`Wallet connection failed: ${err.message}`);
      throw err;
    }
  };

  // Sign the user's address for authentication
  const signAddress = async (address: string) => {
    try {
      console.log('Signing address:', address);
      const sig = await window.ethereum.request({
        method: 'personal_sign',
        params: [address, address],
      });
      console.log('Signature created:', sig.slice(0, 10) + '...');
      setSignature(sig);
      return sig;
    } catch (err: any) {
      console.error('Signing error:', err);
      setError(`Signing failed: ${err.message}`);
      throw err;
    }
  };

  // Try uploading to different IPFS gateways
  const tryUploadWithGateways = async (
    file: File,
    addr: string,
    sig: string,
    currentIndex = 0
  ): Promise<any> => {
    if (currentIndex >= IPFS_GATEWAYS.length) {
      throw new Error(
        'Failed to upload to all available IPFS gateways. Please try again later.'
      );
    }

    const gatewayUrl = IPFS_GATEWAYS[currentIndex];
    setCurrentGateway(gatewayUrl);

    try {
      console.log(
        `Trying IPFS gateway (${currentIndex + 1}/${
          IPFS_GATEWAYS.length
        }): ${gatewayUrl}`
      );

      // Create auth header
      const authBasic = btoa(`eth-${addr}:${sig}`);

      // Create IPFS client with current gateway
      const ipfs = create({
        url: gatewayUrl,
        headers: { authorization: 'Basic ' + authBasic },
        timeout: 90000, // 90 seconds timeout (increased)
      });

      // Upload file with progress tracking
      const result = await ipfs.add(file, {
        progress: (prog) => {
          const progressPercent = Math.round((prog / file.size) * 100);
          console.log(`Upload progress: ${progressPercent}%`);
          setUploadProgress(progressPercent);
        },
      });

      return result;
    } catch (err) {
      console.error(`Upload failed with gateway ${gatewayUrl}:`, err);

      // Try next gateway
      return tryUploadWithGateways(file, addr, sig, currentIndex + 1);
    }
  };

  // Upload file to IPFS and pin it on Crust Network
  const uploadFile = async (file: File) => {
    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Connect wallet if not connected
      const addr = account || (await connectWallet());
      const sig = signature || (await signAddress(addr));

      console.log('Uploading to IPFS via gateway...');

      // Try uploading to available gateways
      const { cid, size } = await tryUploadWithGateways(file, addr, sig);
      const fileCid = cid.toString();
      console.log('Successfully uploaded to IPFS. CID:', fileCid);

      // Create auth header for pinning
      const authBearer = btoa(`eth-${addr}:${sig}`);

      // 3. Pin the file on Crust Network
      console.log('Pinning file on Crust Network...');

      // Try pinning with retries
      let pinAttempts = 0;
      let pinResponse = null;

      while (pinAttempts < 3) {
        try {
          pinResponse = await fetch('https://pin.crustcode.com/psa/pins', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + authBearer,
            },
            body: JSON.stringify({
              cid: fileCid,
              name: file.name,
            }),
          });

          if (pinResponse.ok) break;

          pinAttempts++;
          console.log(`Pinning attempt ${pinAttempts} failed, retrying...`);
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s between retries
        } catch (pinErr) {
          pinAttempts++;
          console.error(`Pinning attempt ${pinAttempts} error:`, pinErr);
        }
      }

      if (!pinResponse || !pinResponse.ok) {
        const errorText = pinResponse
          ? await pinResponse.text()
          : 'No response';
        throw new Error(
          `Pinning failed after ${pinAttempts} attempts: ${errorText}`
        );
      }

      const pinData = await pinResponse.json();
      console.log('File pinned successfully. RequestID:', pinData.requestid);

      // 4. Update UI with file info
      const fileSize = size ? `${(size / 1024).toFixed(2)} KB` : 'Unknown size';

      setFiles((prev) => [
        ...prev,
        {
          cid: fileCid,
          name: file.name,
          size: fileSize,
          requestId: pinData.requestid,
        },
      ]);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Something went wrong during upload.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Delete (unpin) a file from Crust Network
  const deleteFile = async (requestId: string, fileCid: string) => {
    setError('');
    try {
      if (!account) {
        await connectWallet();
      }

      // Ensure we have a signature
      const sig = 'cTKAAvkA2theASfjxvEGidrrUvVJ77Zb3WHMsM3Nx7Vx5Qzok';
      const authBearer = btoa(`eth-${account}:${sig}`);

      console.log('Unpinning file with request ID:', requestId);

      const response = await fetch(
        `https://pin.crustcode.com/psa/pins/${requestId}`,
        {
          method: 'DELETE',
          headers: { Authorization: 'Bearer ' + authBearer },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Unpinning failed (${response.status}): ${errorText}`);
      }

      // Remove file from list
      setFiles(files.filter((f) => f.cid !== fileCid));
      console.log('File unpinned successfully');
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'Something went wrong during file deletion.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">CrustFiles Web3 Storage Demo</h2>

      <div className="mb-6">
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {account
            ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
            : 'Connect MetaMask'}
        </button>
      </div>

      {account && (
        <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-md">
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full"
            disabled={uploading}
          />
          {uploading && (
            <div className="mt-4">
              <div className="text-sm text-blue-500">
                Uploading via {currentGateway.split('/api')[0]}...{' '}
                {uploadProgress}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {files.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Your Files</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Name</th>
                  <th className="py-2 px-4 border-b text-left">Size</th>
                  <th className="py-2 px-4 border-b text-left">CID</th>
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-gray-50' : ''}
                  >
                    <td className="py-2 px-4 border-b">{file.name}</td>
                    <td className="py-2 px-4 border-b">{file.size}</td>
                    <td className="py-2 px-4 border-b">
                      <span className="font-mono text-sm">
                        {file.cid.slice(0, 6)}...{file.cid.slice(-6)}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex space-x-2">
                        <a
                          href={`https://ipfs-w3auth.crustapps.io/ipfs/${file.cid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          View
                        </a>
                        <button
                          onClick={() => deleteFile(file.requestId, file.cid)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashDemo;
