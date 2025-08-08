import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWeb3 } from '@/contexts/Web3Context';
import { useWalletConnect } from '@/contexts/WalletConnectContext';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import {
  encryptFile,
  deriveEncryptionKey,
  deriveEncryptionKeyFromMnemonic,
} from '@/Utils/CryptoLogic';
import { getFileType, formatSize } from './utils';

import Box from '@mui/material/Box';
import { CloudUpload, Download } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { green, red } from '@mui/material/colors';
import Fab from '@mui/material/Fab';
import CheckIcon from '@mui/icons-material/Check';
import FileTypePieChart from '@/components/FileTypePieChart';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface UploadFileProps {
  theme: string;
  onFileSelect: (file: any, previewData: any) => void;
  onUploadSuccess: () => void;
  openMnemonicDialog: () => void;
  mnemonic: string | null;
  privateKey: string | null;
}

const UploadFile: React.FC<UploadFileProps> = ({
  theme,
  onFileSelect,
  onUploadSuccess,
  openMnemonicDialog,
  mnemonic,
  privateKey,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const uploadTimer = useRef<ReturnType<typeof setTimeout>>();
  const pendingOperation = useRef<(() => void) | null>(null);

  const { isAuthenticated, authenticationType, user } = useAuth();
  const { address: metamaskAddress } = useWeb3();
  const { account: wcAccount } = useWalletConnect();

  const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) {
      if (selected.size > MAX_FILE_SIZE) {
        alert('File size should not be greater than 200MB');
        return;
      }
      setFile(selected);
      setFileName(selected.name);

      const previewUrl = URL.createObjectURL(selected);
      const fileType = getFileType(selected.name);
      const previewData = {
        id: 'local-preview',
        name: selected.name,
        size: formatSize(selected.size),
        type: fileType,
        previewUrl: previewUrl,
        isLocal: true,
        lastModified: new Date(selected.lastModified).toLocaleString(),
      };

      onFileSelect(selected, previewData);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      alert('Please select a file to upload');
      return;
    } else if (!isAuthenticated) {
      alert('User Authentication failed');
      return;
    }

    // Check if we have mnemonic or private key
    if (!mnemonic && !privateKey) {
      // Save the operation to execute after mnemonic is provided
      pendingOperation.current = () => uploadFile();
      openMnemonicDialog();
      return;
    }

    setUploadSuccess(false);
    setUploadLoading(true);

    try {
      // Derive encryption key
      let encryptionKey;
      if (mnemonic) {
        encryptionKey = deriveEncryptionKeyFromMnemonic(mnemonic);
      } else if (privateKey) {
        encryptionKey = deriveEncryptionKey(privateKey);
      } else {
        throw new Error('No encryption key available');
      }

      // Encrypt the file
      const encryptedData = await encryptFile(file, encryptionKey);

      // Create blob from encrypted data
      const encryptedBlob = new Blob([encryptedData.encrypted], {
        type: 'application/encrypted',
      });

      // Create file object
      let encryptedFile;
      try {
        encryptedFile = new window.File(
          [encryptedBlob],
          `${file.name}.encrypted`,
          {
            type: 'application/encrypted',
            lastModified: new Date().getTime(),
          }
        );
      } catch (e) {
        encryptedFile = new Blob([encryptedBlob], {
          type: 'application/encrypted',
        });
        (encryptedFile as any).name = `${file.name}.encrypted`;
      }

      const formData = new FormData();
      formData.append('file', encryptedFile);
      formData.append('isEncrypted', 'true');
      formData.append('originalName', encryptedData.originalName);
      formData.append('originalType', encryptedData.originalType);
      formData.append('originalSize', encryptedData.originalSize.toString());

      let endpoint;

      if (authenticationType === 'metamask') {
        if (!metamaskAddress) {
          alert('MetaMask address is missing');
          return;
        }
        formData.append('wallet', metamaskAddress);
        endpoint = `${
          import.meta.env.VITE_BACKEND_PORT_URL
        }/api/filebase/upload`;
      } else if (authenticationType === 'walletConnect') {
        if (!wcAccount) {
          alert('WalletConnect address is missing');
          return;
        }
        formData.append('wallet', wcAccount);
        endpoint = `${
          import.meta.env.VITE_BACKEND_PORT_URL
        }/api/filebase/upload`;
      } else if (authenticationType === 'google') {
        if (!user?.email) {
          alert('Google email is missing');
          return;
        }
        formData.append('email', user.email || '');
        endpoint = `${
          import.meta.env.VITE_BACKEND_PORT_URL
        }/api/filebase/google/upload`;
      } else {
        throw new Error('Unknown authentication type');
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: 'Encrypted Upload Successful',
          className:
            'font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider',
          description: `${file.name} (encrypted)`,
        });
        setFile(null);
        setFileName('');
        setUploadSuccess(true);
        onUploadSuccess();
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('Encryption or upload error:', err);
      alert('Error: ' + err.message);
    } finally {
      setUploadLoading(false);
      // Reset success after a short delay
      uploadTimer.current = setTimeout(() => setUploadSuccess(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-5 mt-1">
      <Input
        id="file-upload"
        type="file"
        onChange={handleFileChange}
        disabled={uploadLoading}
        className={`flex-1 ${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-700 text-white'
            : 'bg-white border-gray-300'
        }`}
        style={{ minWidth: 0 }}
      />
      <Box
        sx={{
          m: 1,
          display: 'inline-block',
          position: 'relative',
        }}
      >
        <Fab
          aria-label="upload"
          className={`text-white hover:text-[#00BFFF] `}
          sx={{
            width: 70,
            height: 70,
            color: '#fff',
            bgcolor: ['#00BFFF'],
            position: 'relative',
            zIndex: 2,
          }}
          onClick={uploadFile}
          disabled={uploadLoading || !isAuthenticated}
        >
          {uploadSuccess ? (
            <CheckIcon sx={{ fontSize: 40 }} />
          ) : (
            <CloudUpload style={{ height: '3rem', width: '3rem' }} />
          )}
        </Fab>
        {uploadLoading && (
          <CircularProgress
            size={75}
            sx={{
              color: '#00BFFF',
              position: 'absolute',
              top: -4,
              left: -4,
              zIndex: 1,
            }}
          />
        )}
      </Box>
    </div>
  );
};

export default UploadFile;
