// src/components/DashDemo.tsx

import React, { useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { typesBundleForPolkadot } from '@crustio/type-definitions';
import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';

// Polyfill for browser environment
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

// Configuration
const POLKADOT_WSS_ENDPOINT = 'wss://rpc.polkadot.io'; // Main Polkadot network
const IPFS_GATEWAY_URL = 'https://crustipfs.xyz/api/v0';
// Alternative gateways if needed:
// const IPFS_GATEWAY_URL = 'https://gw.crustfiles.app/api/v0';
// const IPFS_GATEWAY_URL = 'https://pin.crustcode.com/api/v0';

type UploadState =
  | 'Idle'
  | 'Connecting'
  | 'Uploading'
  | 'PlacingOrder'
  | 'Success'
  | 'Error';

const DashDemo: React.FC = () => {
  // State Management
  const [publicKey, setPublicKey] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [status, setStatus] = useState<UploadState>('Idle');
  const [progress, setProgress] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [fileCid, setFileCid] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ name: string; cid: string; size: number }>
  >([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Connect to Crust Network
  const connectToNetwork = async () => {
    if (api) return; // Already connected

    setStatus('Connecting');
    try {
      console.log('Connecting to Polkadot Network...');
      const wsProvider = new WsProvider(POLKADOT_WSS_ENDPOINT);
      const polkadotApi = await ApiPromise.create({
        provider: wsProvider,
        // Remove Crust-specific type bundle if it's not compatible with Polkadot
        // typesBundle: typesBundleForPolkadot,
      });

      await polkadotApi.isReady;
      setApi(polkadotApi);
      setIsConnected(true);
      setStatus('Idle');
      console.log('Connected to Polkadot Network!');
    } catch (err) {
      console.error('API Initialization Error:', err);
      setStatus('Error');
      setErrorMessage('Failed to connect to Polkadot Network.');
    }
  };

  // Disconnect on unmount
  useEffect(() => {
    return () => {
      if (api) {
        console.log('Disconnecting from Crust Network');
        api.disconnect();
      }
    };
  }, [api]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  // Handle file upload with manual auth
  const uploadFile = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    if (!publicKey.trim()) {
      alert('Please enter your public key');
      return;
    }

    if (!signature.trim()) {
      alert('Please enter your signature');
      return;
    }

    if (!api) {
      await connectToNetwork();
      if (!api) {
        alert('Failed to connect to Crust Network. Please try again.');
        return;
      }
    }

    setStatus('Uploading');
    setProgress(0);

    try {
      // Construct authorization header from provided credentials
      const authHeaderRaw = `crust-${publicKey}:${signature}`;
      const authToken = `Basic ${Buffer.from(authHeaderRaw).toString(
        'base64'
      )}`;

      console.log('Connecting to IPFS gateway...');
      const ipfsClient = create({
        url: IPFS_GATEWAY_URL,
        headers: { authorization: authToken },
        timeout: 60000, // 60 second timeout
      });

      console.log('Uploading file to IPFS...');
      const added = await ipfsClient.add(file, {
        progress: (prog) => {
          const progressPercent = Math.round((prog / file.size) * 100);
          setProgress(Math.min(progressPercent, 90)); // Cap at 90% until order is placed
        },
      });

      const cid = added.cid.toString();
      const fileSize = added.size;
      setFileCid(cid);
      console.log(`File uploaded to IPFS with CID: ${cid}`);

      // Place storage order on Crust Network
      setStatus('PlacingOrder');
      console.log('Placing storage order...');
      const tx = api.tx.market.placeStorageOrder(cid, fileSize, 0, '');

      await new Promise<void>((resolve, reject) => {
        tx.signAndSend(
          publicKey,
          {
            signer: {
              // This is a simplified signer that uses the provided signature
              // In a real app, you would use Polkadot.js extension for signing
              signRaw: async () => ({ signature }),
            } as any,
          },
          ({ status, events, dispatchError }) => {
            if (status.isInBlock) {
              console.log(`Transaction included in block: ${status.asInBlock}`);
              setProgress(95);
            } else if (status.isFinalized) {
              console.log(
                `Transaction finalized in block: ${status.asFinalized}`
              );

              if (dispatchError) {
                let errorMsg = 'Transaction failed';
                if (dispatchError.isModule) {
                  const decoded = api.registry.findMetaError(
                    dispatchError.asModule
                  );
                  errorMsg = `${decoded.section}.${decoded.name}: ${decoded.docs}`;
                } else {
                  errorMsg = dispatchError.toString();
                }
                reject(new Error(errorMsg));
                return;
              }

              setProgress(100);

              // Add to uploaded files list
              setUploadedFiles((prev) => [
                ...prev,
                {
                  name: file.name,
                  cid: cid,
                  size: fileSize,
                },
              ]);

              setStatus('Success');
              setFile(null);
              resolve();
            }
          }
        ).catch(reject);
      });
    } catch (error: any) {
      console.error('Upload failed:', error);
      setStatus('Error');
      setErrorMessage(error.message || 'Unknown error occurred');
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        marginTop: '50px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      <h1>Manual Crust Network Authentication</h1>

      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px',
          border: '1px solid #e9ecef',
        }}
      >
        <h3>Understanding Authentication</h3>
        <p>
          <strong>Public Key:</strong> Your Crust Network account address (e.g.,
          5FHneW46...). This is <em>not</em> your private key.
        </p>
        <p>
          <strong>Signature:</strong> A cryptographic signature created by your
          wallet by signing your public key. This is <em>not</em> your private
          key.
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Connection Status</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#4CAF50' : '#FF9800',
            }}
          ></div>
          <span>
            {isConnected ? 'Connected to Crust Network' : 'Not Connected'}
          </span>
          {!isConnected && (
            <button
              onClick={connectToNetwork}
              style={{
                padding: '5px 10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginLeft: '10px',
              }}
            >
              Connect
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Authentication Credentials</h3>
        <div style={{ marginBottom: '10px' }}>
          <label
            htmlFor="publicKey"
            style={{ display: 'block', marginBottom: '5px' }}
          >
            Public Key (Your Account Address):
          </label>
          <input
            type="text"
            id="publicKey"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            placeholder="e.g., 5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ced4da',
            }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label
            htmlFor="signature"
            style={{ display: 'block', marginBottom: '5px' }}
          >
            Signature:
          </label>
          <input
            type="text"
            id="signature"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Your signature"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ced4da',
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>File Upload</h3>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="file"
            onChange={handleFileChange}
            disabled={status === 'Uploading' || status === 'PlacingOrder'}
            style={{ marginBottom: '10px' }}
          />
          {file && (
            <div style={{ marginTop: '5px' }}>
              Selected: {file.name} ({formatFileSize(file.size)})
            </div>
          )}
        </div>
        <button
          onClick={uploadFile}
          disabled={
            !file || status === 'Uploading' || status === 'PlacingOrder'
          }
          style={{
            padding: '8px 16px',
            backgroundColor:
              !file || status === 'Uploading' || status === 'PlacingOrder'
                ? '#cccccc'
                : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor:
              !file || status === 'Uploading' || status === 'PlacingOrder'
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          {status === 'Uploading' || status === 'PlacingOrder'
            ? 'Uploading...'
            : 'Upload File'}
        </button>
      </div>

      {(status === 'Uploading' || status === 'PlacingOrder') && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '5px' }}>
            {status === 'Uploading'
              ? 'Uploading to IPFS...'
              : 'Placing storage order...'}
          </div>
          <div
            style={{
              width: '100%',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              height: '10px',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                backgroundColor: '#4CAF50',
                height: '10px',
                borderRadius: '4px',
                transition: 'width 0.3s',
              }}
            ></div>
          </div>
          <div
            style={{ textAlign: 'right', fontSize: '0.8rem', marginTop: '5px' }}
          >
            {progress}%
          </div>
        </div>
      )}

      {status === 'Error' && (
        <div
          style={{
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            border: '1px solid #f5c6cb',
          }}
        >
          <strong>Error: </strong>
          {errorMessage}
        </div>
      )}

      {status === 'Success' && (
        <div
          style={{
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '4px',
            border: '1px solid #c3e6cb',
          }}
        >
          <strong>Success! </strong>File uploaded with CID: {fileCid}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div>
          <h3>Uploaded Files</h3>
          <div>
            {uploadedFiles.map((f, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: '10px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #e9ecef',
                }}
              >
                <div>
                  <strong>{f.name}</strong> ({formatFileSize(f.size)})
                </div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    marginTop: '5px',
                    wordBreak: 'break-all',
                  }}
                >
                  CID: <code>{f.cid}</code>
                </div>
                <div style={{ marginTop: '5px' }}>
                  <a
                    href={`https://ipfs.io/ipfs/${f.cid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#007bff', textDecoration: 'none' }}
                  >
                    View on IPFS Gateway
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px',
          border: '1px solid #e9ecef',
        }}
      >
        <h3>How to Generate a Signature</h3>
        <p>To generate a valid signature:</p>
        <ol>
          <li>Install the Polkadot.js browser extension</li>
          <li>Create or import your Crust Network account</li>
          <li>Use the extension to sign your public key (account address)</li>
          <li>
            The signature will be used to authenticate with the IPFS gateway
          </li>
        </ol>
        <p>
          Note: For proper integration, consider using the Polkadot.js extension
          directly as shown in the reference implementation.
        </p>
      </div>
    </div>
  );
};

export default DashDemo;
