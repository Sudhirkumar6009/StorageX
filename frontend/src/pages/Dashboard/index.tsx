import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWeb3 } from '@/contexts/Web3Context';
import { useWalletConnect } from '@/contexts/WalletConnectContext';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import CryptoJS from 'crypto-js';
import { Button } from '@/components/ui/button';
import {
  deriveEncryptionKeyFromMnemonic,
  deriveEncryptionKey,
} from '@/Utils/CryptoLogic';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import FileModal from '@/components/FileModal';
import { fetchAndDecryptFile, guessFileType } from '@/Utils/DecryptionLogic';

// Import our refactored components
import UploadFile from './UploadFile';
import VisualizeStorage from './VisualizeStorage';
import PreviewSelectionFile from './PreviewSelectionFile';
import FilesList from './FilesList';
import { getFileType } from './utils';

// Helper function to convert CryptoJS WordArray to Uint8Array
const convertWordArrayToUint8Array = (
  wordArray: CryptoJS.lib.WordArray
): Uint8Array => {
  const arrayOfWords = wordArray.words;
  const length = wordArray.sigBytes;
  const uint8Array = new Uint8Array(length);

  let offset = 0;
  for (let i = 0; i < arrayOfWords.length; i++) {
    const word = arrayOfWords[i];
    uint8Array[offset++] = (word >> 24) & 0xff;
    if (offset < length) uint8Array[offset++] = (word >> 16) & 0xff;
    if (offset < length) uint8Array[offset++] = (word >> 8) & 0xff;
    if (offset < length) uint8Array[offset++] = word & 0xff;
  }

  return uint8Array;
};

// Decrypt file function
const decryptFile = (
  encryptedData: string,
  encryptionKey: string,
  originalType: string
): Blob => {
  // Decrypt the data
  const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey);

  // Convert WordArray to Uint8Array
  const typedArray = convertWordArrayToUint8Array(decrypted);
  const arrayBuffer =
    typedArray.buffer instanceof ArrayBuffer
      ? typedArray.buffer
      : new ArrayBuffer(typedArray.length);
  const compatibleTypedArray = new Uint8Array(arrayBuffer);
  // Create a blob with the original MIME type
  return new Blob([compatibleTypedArray], {
    type: originalType || 'application/octet-stream',
  });
};

interface FileItem {
  id: string;
  name: string;
  cid: string;
  key: string;
  size: string;
  type:
    | 'image'
    | 'video'
    | 'pdf'
    | 'doc'
    | 'excel'
    | 'ppt'
    | 'archive'
    | 'audio'
    | 'other';
  preview?: string;
  isEncrypted?: boolean;
  originalName?: string;
  originalType?: string;
  decryptedUrl?: string;
}

const Dashboard = () => {
  const [cids, setCids] = useState<string[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<{ address: string } | null>(null);
  const { theme } = useTheme();
  const { isAuthenticated, authenticationType, user } = useAuth();
  const [file, setFile] = useState(null);
  const [decryptLoading, setDecryptLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const { account: wcAccount } = useWalletConnect();
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address: metamaskAddress } = useWeb3();
  const [allCids, setAllCids] = useState<{ key: string; cid: string }[]>([]);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [fileToRemove, setFileToRemove] = useState<FileItem | null>(null);
  const [result, setResult] = useState(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [mnemonicDialogOpen, setMnemonicDialogOpen] = useState(false);
  const pendingOperation = useRef<(() => void) | null>(null);
  const [decryptedUrls, setDecryptedUrls] = useState<Record<string, string>>(
    {}
  );
  const [isDecrypting, setIsDecrypting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchAll = async () => {
      if (!isAuthenticated) return;

      let addressToUse = '';
      if (authenticationType === 'metamask') {
        addressToUse = metamaskAddress;
      } else if (authenticationType === 'walletConnect') {
        addressToUse = wcAccount;
      } else if (authenticationType === 'google') {
        addressToUse = user?.email;
      }

      if (!addressToUse) return;

      await fetchProfile(addressToUse);
      await fetchCids();
      setTimeout(() => {
        fetchFilebaseList();
      }, 0);
    };
    fetchAll();
  }, [
    isAuthenticated,
    metamaskAddress,
    wcAccount,
    user?.email,
    authenticationType,
  ]);

  // Replace the fetchPrivateKey function with this mnemonic-based approach
  useEffect(() => {
    const checkForMnemonicOrPrivateKey = async () => {
      if (!isAuthenticated) return;

      try {
        // First try to get stored mnemonic from localStorage (encrypted)
        const storedMnemonic = localStorage.getItem('encrypted_mnemonic');

        if (storedMnemonic) {
          setMnemonic(storedMnemonic);
          return;
        }

        // If no mnemonic is stored, try to fetch private key as fallback
        let endpoint;
        let payload = {};

        if (authenticationType === 'metamask') {
          endpoint = `${
            import.meta.env.VITE_BACKEND_PORT_URL
          }/api/get-private-key`;
          payload = { Wallet: metamaskAddress };
        } else if (authenticationType === 'walletConnect') {
          endpoint = `${
            import.meta.env.VITE_BACKEND_PORT_URL
          }/api/get-private-key`;
          payload = { Wallet: wcAccount };
        } else {
          // For Google accounts or others, you may need a different approach
          return;
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success && data.privateKey) {
          setPrivateKey(data.privateKey);
        } else {
          setMnemonicDialogOpen(true);
        }
      } catch (error) {
        console.error('Failed to get encryption key:', error);
        setMnemonicDialogOpen(true);
      }
    };

    checkForMnemonicOrPrivateKey();
  }, [isAuthenticated, authenticationType, metamaskAddress, wcAccount]);

  const fetchCids = async () => {
    setError('');
    setCids([]);
    try {
      let res;
      if (authenticationType === 'metamask') {
        res = await fetch(
          `${import.meta.env.VITE_BACKEND_PORT_URL}/api/fetch_cids`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Wallet: metamaskAddress }),
          }
        );
      } else if (authenticationType === 'walletConnect') {
        res = await fetch(
          `${import.meta.env.VITE_BACKEND_PORT_URL}/api/fetch_cids`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Wallet: wcAccount }),
          }
        );
      } else if (authenticationType === 'google') {
        res = await fetch(
          `${import.meta.env.VITE_BACKEND_PORT_URL}/api/google/fetch_cids`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user?.email }),
          }
        );
      } else {
        setError('');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setCids(data.cids);
      } else if (data.error && data.error.toLowerCase().includes('no files')) {
        setCids([]);
        setError('');
      } else if (data.error) {
        setError(data.error);
      } else {
        setError('');
      }
    } catch (err) {
      setError('Error fetching CIDs');
    }
  };

  const fetchProfile = async (addressOrEmail: string) => {
    try {
      let url = '';
      if (authenticationType === 'google') {
        url = `${
          import.meta.env.VITE_BACKEND_PORT_URL
        }/api/profile/show/google/${addressOrEmail}`;
      } else {
        url = `${
          import.meta.env.VITE_BACKEND_PORT_URL
        }/api/profile/show/${addressOrEmail}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data) {
        setProfile({ address: data.data.address || addressOrEmail });
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    }
  };

  const fetchFilebaseList = async () => {
    setError('');
    if (!isAuthenticated) {
      setError('Authentication required to view your files');
      return;
    }
    await fetchProfile(metamaskAddress);
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_BACKEND_PORT_URL
        }/api/filebase/list-cids?ts=${Date.now()}`
      );
      const data = await res.json();
      if (data.success) {
        setFileList(data.files);
      } else if (data.error && data.error.toLowerCase().includes('no files')) {
        setFileList([]);
        setError('');
      } else if (data.error) {
        setError(data.error);
      } else {
        setError('');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Add cleanup for preview URLs
  useEffect(() => {
    return () => {
      if (previewFile?.previewUrl && previewFile.isLocal) {
        URL.revokeObjectURL(previewFile.previewUrl);
      }
    };
  }, [previewFile]);

  // Function to download and decrypt files
  const downloadDecryptedFile = async (file) => {
    if (!mnemonic && !privateKey) {
      pendingOperation.current = () => downloadDecryptedFile(file);
      setMnemonicDialogOpen(true);
      return;
    }

    setDecryptLoading(true);

    try {
      const response = await fetch(
        `https://cooperative-salmon-galliform.myfilebase.com/ipfs/${file.cid}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch encrypted file');
      }

      const encryptedText = await response.text();
      let originalName = file.originalName || file.key;
      if (!file.originalName && file.key.endsWith('.encrypted')) {
        originalName = file.key.slice(0, -10);
      }

      let encryptionKey;
      if (mnemonic) {
        encryptionKey = deriveEncryptionKeyFromMnemonic(mnemonic);
      } else if (privateKey) {
        encryptionKey = deriveEncryptionKey(privateKey);
      } else {
        throw new Error('No decryption key available');
      }

      const decryptedBlob = decryptFile(
        encryptedText,
        encryptionKey,
        file.originalType || 'application/octet-stream'
      );

      const url = URL.createObjectURL(decryptedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      toast({
        title: 'File Decrypted',
        description: `Successfully decrypted ${originalName}`,
        className:
          'font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider',
      });
    } catch (error) {
      console.error('Decryption error:', error);
      toast({
        title: 'Decryption Failed',
        description: error.message || 'Could not decrypt the file',
        variant: 'destructive',
      });
    } finally {
      setDecryptLoading(false);
    }
  };

  // Function to decrypt files in bulk
  const decryptFilesInBulk = async (files) => {
    const mnemonic = localStorage.getItem('encrypted_mnemonic');
    if (!mnemonic) return;

    const encryptedFiles = files.filter(
      (file) =>
        file.key?.endsWith('.encrypted') &&
        !decryptedUrls[file.cid] &&
        !isDecrypting[file.cid]
    );

    if (encryptedFiles.length === 0) return;

    const newDecrypting = { ...isDecrypting };
    encryptedFiles.forEach((file) => {
      newDecrypting[file.cid] = true;
    });

    setIsDecrypting(newDecrypting);
    const batchSize = 3;

    for (let i = 0; i < encryptedFiles.length; i += batchSize) {
      const batch = encryptedFiles.slice(i, i + batchSize);
      const promises = batch.map(async (file) => {
        try {
          const originalName = file.originalName || file.key.slice(0, -10);
          const originalType = file.originalType || guessFileType(originalName);

          const url = await fetchAndDecryptFile(
            file.cid,
            mnemonic,
            originalName,
            originalType
          );

          return { cid: file.cid, url, success: true };
        } catch (error) {
          console.error(`Failed to decrypt ${file.key}:`, error);
          return { cid: file.cid, url: null, success: false };
        }
      });

      const results = await Promise.all(promises);

      setDecryptedUrls((prev) => {
        const newUrls = { ...prev };
        results.forEach((result) => {
          if (result.url) {
            newUrls[result.cid] = result.url;
          }
        });
        return newUrls;
      });

      setIsDecrypting((prev) => {
        const updated = { ...prev };
        results.forEach((result) => {
          delete updated[result.cid];
        });
        return updated;
      });

      if (i + batchSize < encryptedFiles.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  };

  // Effect to fetch and decrypt files
  useEffect(() => {
    const fetchFileList = async () => {
      await fetchFilebaseList();
      if (fileList.length > 0) {
        decryptFilesInBulk(fileList);
      }
    };
    if (isAuthenticated) {
      fetchFileList();
    }
  }, [isAuthenticated, cids]);

  const handleView = (file: any) => {
    let fileType = getFileType(file.key || file.name);
    const isEncrypted = file.key?.endsWith('.encrypted');
    let originalName = file.originalName;

    if (isEncrypted) {
      if (file.originalName) {
        fileType = getFileType(file.originalName);
        originalName = file.originalName;
      } else {
        originalName = file.key.slice(0, -10);
        fileType = getFileType(originalName);
      }
    }

    const originalType = file.originalType || guessFileType(originalName);

    setSelectedFile({
      ...file,
      id: file.id || String(Math.random()),
      name: file.name || file.key,
      key: file.key || file.name,
      type: fileType,
      size: file.size || 'N/A',
      decryptedUrl: decryptedUrls[file.cid] || null,
      isEncrypted,
      originalName,
      originalType,
    });

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  const handleRemoveFile = async (file: any) => {
    console.log('handleRemoveFile called with:', file);
    try {
      let res;
      if (authenticationType === 'metamask') {
        res = await fetch(
          `${import.meta.env.VITE_BACKEND_PORT_URL}/api/filebase/delete`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              Wallet: metamaskAddress,
              cid: file.cid,
              fileName: file.key,
            }),
          }
        );
      } else if (authenticationType === 'walletConnect') {
        res = await fetch(
          `${import.meta.env.VITE_BACKEND_PORT_URL}/api/filebase/delete`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              Wallet: wcAccount,
              cid: file.cid,
              fileName: file.key,
            }),
          }
        );
      } else if (authenticationType === 'google') {
        res = await fetch(
          `${import.meta.env.VITE_BACKEND_PORT_URL}/api/filebase/google/delete`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user?.email,
              cid: file.cid,
              fileName: file.key,
            }),
          }
        );
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to remove file');
      }

      // Update UI state
      setFileList((prev) => prev.filter((f) => f.cid !== file.cid));

      toast({
        title: 'Success',
        className:
          'font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider',
        description: 'File removed successfully',
      });
    } catch (err) {
      console.error('Remove error:', err);
      toast({
        title: 'Error',
        className:
          'font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleFileSelect = (selectedFile, previewData) => {
    setFile(selectedFile);
    setPreviewFile(previewData);
  };

  const handleUploadSuccess = () => {
    fetchCids();
    fetchFilebaseList();
  };

  const MnemonicDialog = () => (
    <Dialog
      open={mnemonicDialogOpen}
      onClose={() => {
        // Only close if not performing an operation
        if (!pendingOperation.current) {
          setMnemonicDialogOpen(false);
        }
      }}
      aria-labelledby="mnemonic-dialog-title"
    >
      <DialogTitle
        id="mnemonic-dialog-title"
        style={{ textAlign: 'center', color: '#00BFFF' }}
      >
        Enter Your Mnemonic Phrase
      </DialogTitle>
      <DialogContent>
        <p style={{ marginBottom: '1rem' }}>
          Please enter your mnemonic phrase to encrypt/decrypt your files. This
          is the same phrase you used when creating your account.
        </p>
        <TextField
          autoFocus
          multiline
          rows={3}
          fullWidth
          variant="outlined"
          placeholder="Enter your mnemonic phrase..."
          value={mnemonic || ''}
          onChange={(e) => setMnemonic(e.target.value)}
          style={{ marginTop: '1rem' }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            // Store mnemonic encrypted in localStorage (for the session)
            if (mnemonic) {
              localStorage.setItem('encrypted_mnemonic', mnemonic);

              // If there's a pending operation, execute it
              if (pendingOperation.current) {
                pendingOperation.current();
                pendingOperation.current = null;
              }
            }
            setMnemonicDialogOpen(false);
          }}
          style={{
            backgroundColor: '#00BFFF',
            color: 'black',
            margin: '0 auto 1rem auto',
            width: '80%',
            padding: '0.75rem',
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      <div
        className={`min-h-screen transition-colors duration-200 mx-auto pt-8 sm:p-8 lg:p-10 ${
          theme === 'dark' ? 'bg-black' : 'bg-white'
        }`}
      >
        <div className="w-full mx-auto px-4 mt-5 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1
              className={`text-4xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold `}
            >
              Storage Dashboard
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Section */}
            <div className="lg:col-span-2">
              <Card
                className={`${
                  theme === 'dark'
                    ? 'bg-gray-900 border-gray-800'
                    : 'bg-white border-gray-200'
                } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-wide`}
              >
                <CardContent className="space-y-4">
                  <UploadFile
                    theme={theme}
                    onFileSelect={handleFileSelect}
                    onUploadSuccess={handleUploadSuccess}
                    openMnemonicDialog={() => setMnemonicDialogOpen(true)}
                    mnemonic={mnemonic}
                    privateKey={privateKey}
                  />
                  {error && <div style={{ color: 'red' }}>Error: {error}</div>}
                  {!isAuthenticated && (
                    <div style={{ color: 'orange', marginTop: 10 }}>
                      Authentication Failure
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Preview File Component */}
              <PreviewSelectionFile previewFile={previewFile} theme={theme} />
            </div>

            {/* Storage Visualization */}
            <div className="space-y-6">
              <VisualizeStorage
                theme={theme}
                fileList={fileList}
                cids={cids}
                authenticationType={authenticationType}
                metamaskAddress={metamaskAddress}
                wcAccount={wcAccount}
                user={user}
              />
            </div>
          </div>

          {/* Files List */}
          <FilesList
            fileList={fileList}
            cids={cids}
            decryptedUrls={decryptedUrls}
            isDecrypting={isDecrypting}
            onViewFile={handleView}
            onRemoveFile={(file) => {
              setFileToRemove(file);
              setShowRemoveConfirm(true);
            }}
            onDecryptFile={downloadDecryptedFile}
          />

          {result && (
            <div
              style={{
                marginTop: '20px',
                color: result.success ? 'green' : 'red',
              }}
            >
              {result.success ? (
                <p>✅ Success: {result.message}</p>
              ) : (
                <p>❌ Error: {result.message}</p>
              )}
            </div>
          )}

          {/* Confirmation Dialog for File Removal */}
          {showRemoveConfirm && fileToRemove && (
            <div
              className="fixed inset-0 z-100 flex items-center justify-center bg-black bg-opacity-40"
              style={{ zIndex: 9999 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg w-80">
                <h2
                  className={`text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider`}
                >
                  Are you sure?
                </h2>
                <p
                  className={`mb-6 text-gray-600 dark:text-gray-300 font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider`}
                >
                  Do you really want to remove this file?
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowRemoveConfirm(false)}
                    className={`font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setShowRemoveConfirm(false);
                      await handleRemoveFile(fileToRemove);
                    }}
                    className={`px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <MnemonicDialog />
      </div>

      {/* File Modal for detailed file view */}
      <FileModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        file={
          selectedFile
            ? {
                ...selectedFile,
                key: selectedFile.key || selectedFile.name,
                cid: selectedFile.cid,
                name: selectedFile.name || selectedFile.key,
                thumbnail: `https://cooperative-salmon-galliform.myfilebase.com/ipfs/${selectedFile.cid}`,
                type:
                  selectedFile.type ||
                  getFileType(selectedFile.key || selectedFile.name),
                decryptedUrl:
                  decryptedUrls[selectedFile.cid] || selectedFile.decryptedUrl,
                originalType:
                  selectedFile.originalType ||
                  guessFileType(
                    selectedFile.originalName ||
                      (selectedFile.isEncrypted &&
                      selectedFile.name.endsWith('.encrypted')
                        ? selectedFile.name.slice(0, -10)
                        : selectedFile.name)
                  ),
              }
            : null
        }
      />
    </>
  );
};

export default Dashboard;
