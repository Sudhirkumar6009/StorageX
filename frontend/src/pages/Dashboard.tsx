import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import CryptoJS from 'crypto-js';
import { useWeb3 } from '@/contexts/Web3Context';
import FileBlock from '@/components/FileBlock';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { green, red } from '@mui/material/colors';
import Fab from '@mui/material/Fab';
import CheckIcon from '@mui/icons-material/Check';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import FileModal from '@/components/FileModal';
import { deleteFile } from './DashDemo';
import { CloudUpload } from 'lucide-react';
import { useWalletConnect } from '../contexts/WalletConnectContext';

const bucket = 'storagex';
const fileToDelete = 'IMG-20220803-WA0014.jpg';

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
}

const Dashboard = () => {
  const [cids, setCids] = useState<string[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<{ address: string } | null>(null);
  const { theme } = useTheme();
  const { isAuthenticated, authenticationType, user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const uploadTimer = React.useRef<ReturnType<typeof setTimeout>>();

  const {
    connectWalletConnect,
    disconnectWalletConnect,
    account: wcAccount,
    isConnected: wcIsConnected,
  } = useWalletConnect();
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address: metamaskAddress, isConnected } = useWeb3();
  const [fileName, setFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [allCids, setAllCids] = useState<{ key: string; cid: string }[]>([]);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [fileToRemove, setFileToRemove] = useState<FileItem | null>(null);
  const [result, setResult] = useState(null);

  const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    metamaskAddress,
    wcAccount,
    user?.email,
    authenticationType,
  ]);

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
        // Don't show error for "no files found"
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

  const canShowFiles =
    profile && metamaskAddress && profile.address?.trim() === metamaskAddress;

  const handleFileChange = (event) => {
    const selected = event.target.files[0];
    if (selected) {
      if (selected.size > MAX_FILE_SIZE) {
        alert('File size should not be greater than 200MB');
        return;
      }
      setFile(selected);
      setFileName(selected.name); // Store the file name
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
    setUploadSuccess(false);
    setUploadLoading(true);
    const formData = new FormData();
    let res;

    try {
      if (authenticationType === 'metamask') {
        // Check if metamaskAddress is valid
        if (!metamaskAddress) {
          alert('MetaMask address is missing');
          return;
        }

        formData.append('file', file);
        formData.append('wallet', metamaskAddress);
        console.log('Uploading with MetaMask wallet:', metamaskAddress);

        res = await fetch(
          `${import.meta.env.VITE_BACKEND_PORT_URL}/api/filebase/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );
      } else if (authenticationType === 'walletConnect') {
        // Check if wcAccount is valid
        if (!wcAccount) {
          alert('WalletConnect address is missing');
          return;
        }

        formData.append('file', file);
        formData.append('wallet', wcAccount);
        console.log('Uploading with WalletConnect wallet:', wcAccount);

        res = await fetch(
          `${import.meta.env.VITE_BACKEND_PORT_URL}/api/filebase/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );
      } else if (authenticationType === 'google') {
        // Your existing Google upload code...
        if (!user?.email) {
          alert('Google email is missing');
          return;
        }

        formData.append('file', file);
        formData.append('email', user.email || '');

        res = await fetch(
          `${import.meta.env.VITE_BACKEND_PORT_URL}/api/filebase/google/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );
      }

      // Handle the response
      const data = await res.json();
      if (data.success) {
        toast({
          title: 'Upload successful',
          className:
            'font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider',
          description: file.name,
        }); // Changed from file.key to file.name
        setFile(null);
        setFileName('');
        await fetchCids();
        await fetchFilebaseList();
        setUploadSuccess(true);
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload error: ' + err.message);
    } finally {
      setUploadLoading(false);
      // Reset success after a short delay
      uploadTimer.current = setTimeout(() => setUploadSuccess(false), 2000);
    }
  };

  const getFileType = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (!ext) return 'other';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext))
      return 'image';
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'video';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'doc';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'excel';
    if (['ppt', 'pptx'].includes(ext)) return 'ppt';
    if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext)) return 'archive';
    if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio';
    return 'other';
  };

  const fetchFileSize = (size: number | string) => {
    const kb = Number(size) / 1024;
    if (isNaN(kb)) return 'Unknown';
    return kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
  };

  const [files, setFiles] = useState<FileItem[]>([]);
  useEffect(() => {
    const buildFiles = async () => {
      if (!allCids) return;
      const filesWithSize = await Promise.all(
        allCids.map(async ({ key, cid }, idx) => {
          const size = await fetchFileSize(cid);
          return {
            id: `${cid}-${idx}`,
            key,
            name: key,
            cid,
            size,
            type: getFileType(key) as FileItem['type'],
            preview:
              getFileType(key) === 'image'
                ? `https://cooperative-salmon-galliform.myfilebase.com/ipfs/${cid}`
                : undefined,
          };
        })
      );
      setFiles(filesWithSize);
    };
    buildFiles();
  }, [allCids]);

  const handleView = (file: any) => {
    console.log('Opening file preview:', file); // For debugging

    // Create a properly formatted file object for the modal
    // Ensure the file type is determined correctly
    const fileType = getFileType(file.key || file.name);

    setSelectedFile({
      ...file,
      id: file.id || String(Math.random()),
      name: file.name || file.key,
      key: file.key || file.name,
      type: fileType,
      size: file.size ? formatSize(Number(file.size)) : 'N/A',
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
      setFiles((prev) => prev.filter((f) => f.cid !== file.cid));
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

  useEffect(() => {
    if (!metamaskAddress) return;
    (async () => {})();
  }, [metamaskAddress]);

  const totalSize = fileList
    .filter((file) => cids.includes(file.cid))
    .reduce((sum, file) => sum + (Number(file.size) || 0), 0);

  const formatSize = (size: number) => {
    if (size >= 1024 ** 4) {
      return `${(size / 1024 ** 4).toFixed(2)} TB`;
    } else if (size >= 1024 ** 3) {
      return `${(size / 1024 ** 3).toFixed(2)} GB`;
    } else if (size >= 1024 ** 2) {
      return `${(size / 1024 ** 2).toFixed(2)} MB`;
    } else if (size >= 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    }
    return `${size} B`;
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 p-10  ${
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
          <p
            className={`mt-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wide`}
          >
            Manage your decentralized storage files
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <Card
              className={`${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800'
                  : 'bg-white border-gray-200'
              }  font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-wide`}
            >
              <CardHeader>
                <CardTitle
                  className={`${
                    theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
                  } tracking-wide uppercase`}
                >
                  Upload to Storage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label
                    htmlFor="file-upload"
                    className={
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }
                  >
                    Select File
                  </Label>
                  <div className="flex items-center gap-5 mt-1">
                    <Input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      disabled={isUploading}
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
                          <CloudUpload
                            style={{ height: '3rem', width: '3rem' }}
                          />
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
                  <p
                    className={`text-sm mt-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    Maximum file size: 200MB
                  </p>
                </div>
                {error && <div style={{ color: 'red' }}>Error: {error}</div>}
                {!isAuthenticated && (
                  <div style={{ color: 'orange', marginTop: 10 }}>
                    Authentication Failure
                  </div>
                )}
              </CardContent>
            </Card>

            <Card
              className={`mt-6 ${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800'
                  : 'bg-white border-gray-200'
              } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wide`}
            >
              <CardHeader>
                <CardTitle
                  className={`${
                    theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
                  } uppercase tracking-wider`}
                >
                  Preview File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Preview selected file</p>
              </CardContent>
            </Card>
          </div>

          {/* Status Panel */}
          <div className="space-y-6">
            <Card
              className={`${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800'
                  : 'bg-white border-gray-200'
              }  font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-widest `}
            >
              <CardHeader>
                <CardTitle
                  className={`${
                    theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
                  } uppercase`}
                >
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label
                    className={
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }
                  >
                    Wallet Address
                  </Label>
                  <p
                    style={{ letterSpacing: '0.1rem' }}
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {authenticationType === 'metamask' && metamaskAddress
                      ? `${metamaskAddress.slice(
                          0,
                          6
                        )}...${metamaskAddress.slice(-4)}`
                      : authenticationType === 'walletConnect' && wcAccount
                      ? `${wcAccount.slice(0, 6)}...${wcAccount.slice(-4)}`
                      : authenticationType === 'google' && user?.email
                      ? user.email
                      : ''}
                  </p>
                </div>
                <p></p>
                <div>
                  <Label
                    className={
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }
                  >
                    File Stored :{' '}
                    {fileList.filter((file) => cids.includes(file.cid)).length}{' '}
                  </Label>
                  <p
                    className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
                    }`}
                  >
                    Uploaded Size : {formatSize(totalSize)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800'
                  : 'bg-white border-gray-200'
              }  font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wide`}
            >
              <CardHeader>
                <CardTitle
                  className={`${
                    theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
                  } tracking-wider uppercase font-bold `}
                >
                  Cloud Infrastructure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    } tracking-none `}
                  >
                    Cloud Connected
                  </p>
                </div>
                <p
                  className={`text-xs mt-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Files are distributed across the InterPlanetary File System
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle
              className={
                'font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider'
              }
            >
              {' '}
              {fileList.filter((file) => cids.includes(file.cid)).length} Files
              Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fileList.length === 0 && cids.length > 0 ? (
              <div
                className={
                  'font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider'
                }
              >
                No files uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {fileList
                  .filter((file) => cids.includes(file.cid))
                  .map((file, idx) => {
                    const fileType = getFileType(file.key);
                    return (
                      <FileBlock
                        key={file.key}
                        id={String(idx)}
                        name={file.key}
                        size={file.size ? formatSize(Number(file.size)) : 'N/A'}
                        type={fileType}
                        cid={file.cid}
                        onView={() =>
                          handleView({
                            ...file,
                            type: fileType,
                            id: String(idx),
                          })
                        }
                        thumbnail={
                          fileType === 'image'
                            ? `https://cooperative-salmon-galliform.myfilebase.com/ipfs/${file.cid}`
                            : undefined
                        }
                        onDelete={() => {
                          setFileToRemove(file);
                          setShowRemoveConfirm(true);
                        }}
                      />
                    );
                  })}
              </div>
            )}
            {/* File preview modal */}
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
                      // Make sure the type is included, especially for images
                      type:
                        selectedFile.type ||
                        getFileType(selectedFile.key || selectedFile.name),
                    }
                  : null
              }
            />
          </CardContent>
        </Card>
        <div>
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
        </div>

        {showRemoveConfirm && fileToRemove && (
          <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black bg-opacity-40"
            style={{ zIndex: 9999 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg w-80">
              <h2
                className={`text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100  font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider`}
              >
                Are you sure ?
              </h2>
              <p
                className={`mb-6 text-gray-600 dark:text-gray-300  font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider`}
              >
                Do you really want to remove this file ?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowRemoveConfirm(false)}
                  className={` font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600`}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowRemoveConfirm(false);
                    await handleRemoveFile(fileToRemove);
                  }}
                  className={`px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600  font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider`}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
