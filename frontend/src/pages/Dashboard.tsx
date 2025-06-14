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
import FileModal from '@/components/FileModal';
import { deleteFile } from './DashDemo';

const bucket = 'storagex';
const fileToDelete = 'IMG-20220803-WA0014.jpg';

interface FileItem {
  id: string;
  name: string;
  cid: string;
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
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address: metamaskAddress, isConnected } = useWeb3();
  const [fileName, setFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewType, setPreviewType] = useState<
    | 'image'
    | 'video'
    | 'pdf'
    | 'doc'
    | 'excel'
    | 'ppt'
    | 'archive'
    | 'audio'
    | 'other'
    | null
  >(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [allCids, setAllCids] = useState<{ name: string; cid: string }[]>([]);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [fileToRemove, setFileToRemove] = useState<FileItem | null>(null);
  const [result, setResult] = useState(null);

  const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

  useEffect(() => {
    if (metamaskAddress) {
      fetchProfile(metamaskAddress);
      fetchCids();
    }
  }, [metamaskAddress]);

  useEffect(() => {
    if (metamaskAddress && cids.length > 0) {
      fetchFilebaseList();
    }
  }, [metamaskAddress, cids.join(',')]);

  const fetchCids = async () => {
    setError('');
    setCids([]);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_PORT_URL}/api/fetch_cids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ MetaMask: metamaskAddress }),
      });
      const data = await res.json();
      if (data.success) {
        setCids(data.cids);
      } else {
        setError(data.message || 'No CIDs found');
      }
    } catch (err) {
      setError('Error fetching CIDs');
    }
  };

  const fetchProfile = async (address: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_PORT_URL}/api/profile/show/${address}`
      );
      const data = await res.json();
      if (data.success && data.data) {
        setProfile({ address: data.data.address || address });
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    }
  };

  const fetchFilebaseList = async () => {
    setError('');
    if (!metamaskAddress) {
      setError('Connect your wallet first.');
      return;
    }
    await fetchProfile(metamaskAddress);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_PORT_URL}/api/filebase/list-cids`
      );
      const data = await res.json();
      if (data.success) {
        setFileList(data.files);
      } else {
        setError(data.error || 'Unknown error');
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
    if (!file || !metamaskAddress) {
      alert('Please select a file and connect wallet first');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metaMask', metamaskAddress);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_PORT_URL}/api/filebase/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Upload successful', description: file.key });
        console.log('Actual File Name:', file.key);
        setFile(null);
        setFileName('');
        fetchFiles();
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };
  // Fetch list of CIDs and metadata from your backend
  const fetchFileList = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/filebase/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metaMask: metamaskAddress }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.files)) {
        return data.files;
      } else {
        console.error('Failed to fetch file list:', data.message || data.error);
        return [];
      }
    } catch (err) {
      console.error('Error fetching file list:', err);
      return [];
    }
  };

  // Utility function to guess file type based on extension
  const guessFileType = (ext: string) => {
    if (!ext) return 'other';
    const map: Record<string, FileItem['type']> = {
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
      gif: 'image',
      mp4: 'video',
      mp3: 'audio',
      pdf: 'pdf',
      doc: 'doc',
      docx: 'doc',
      xls: 'excel',
      xlsx: 'excel',
      ppt: 'ppt',
      pptx: 'ppt',
      zip: 'archive',
      rar: 'archive',
    };
    return map[ext.toLowerCase()] || 'other';
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
        allCids.map(async ({ name, cid }, idx) => {
          const size = await fetchFileSize(cid);
          return {
            id: `${cid}-${idx}`,
            name,
            cid,
            size,
            type: getFileType(name) as FileItem['type'],
            preview:
              getFileType(name) === 'image'
                ? `https://cooperative-salmon-galliform.myfilebase.com/ipfs/${cid}?w=164&h=164&fit=crop&auto=format`
                : undefined,
          };
        })
      );
      setFiles(filesWithSize);
    };
    buildFiles();
  }, [allCids]);

  const handleView = (file: FileItem) => {
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  const handleRemoveFile = async (file: any) => {
    console.log('handleRemoveFile called with:', file);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_PORT_URL}/api/filebase/delete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metaMask: metamaskAddress,
            cid: file.cid,
            fileName: file.key, // <-- Use file.key here!
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove file');
      }

      // Update UI state
      setFiles((prev) => prev.filter((f) => f.cid !== file.cid));
      setFileList((prev) => prev.filter((f) => f.cid !== file.cid));

      toast({
        title: 'Success',
        description: 'File removed successfully',
      });
    } catch (err) {
      console.error('Remove error:', err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const fetchFiles = async () => {
    if (!metamaskAddress) return;
    const res = await fetch(
      `${
        import.meta.env.VITE_BACKEND_PORT_URL || 'http://localhost:3001'
      }/api/filebase/list`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metaMask: metamaskAddress }),
      }
    );
    const data = await res.json();
    if (data.success) {
      setFiles(
        data.files.map((f, idx) => ({
          id: `${f.cid}-${idx}`,
          cid: f.cid,
          name: f.name,
          size: f.size,
          type: getFileType(f.name || ''),
          preview:
            getFileType(f.name || '') === 'image' ? f.preview : undefined,
        }))
      );
    }
  };
  useEffect(() => {
    fetchFiles();
  }, [metamaskAddress]);

  useEffect(() => {
    if (!metamaskAddress) return;
    (async () => {})();
  }, [metamaskAddress]);

  const totalSize = fileList
    .filter((file) => cids.includes(file.cid))
    .reduce((sum, file) => sum + (Number(file.size) || 0), 0);

  // Format size for display
  const formatSize = (size: number) => {
    if (size > 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    } else if (size > 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    }
    return `${size} B`;
  };
  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        theme === 'dark' ? 'bg-black' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Storage Dashboard
          </h1>
          <p
            className={`mt-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
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
              }`}
            >
              <CardHeader>
                <CardTitle
                  className={`${
                    theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
                  }`}
                >
                  Upload to IPFS
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
                  <div className="flex items-center gap-2 mt-1">
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
                    <Button
                      type="button"
                      size="sm"
                      onClick={uploadFile}
                      disabled={loading || !isConnected}
                      className={`h-10 px-4 py-2 ${
                        theme === 'dark'
                          ? 'border-[#00BFFF] text-[#00BFFF] hover:bg-[#00BFFF] hover:text-black'
                          : 'border-[#00BFFF] text-[#00BFFF] hover:bg-[#00BFFF] hover:text-white'
                      }`}
                    >
                      {loading ? 'Uploading...' : 'Upload'}
                    </Button>
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
                {!canShowFiles && (
                  <div style={{ color: 'orange', marginTop: 10 }}>
                    Connect your wallet to view your files.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card
              className={`mt-6 ${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardHeader>
                <CardTitle
                  className={`${
                    theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
                  }`}
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
              }`}
            >
              <CardHeader>
                <CardTitle
                  className={`${
                    theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
                  }`}
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
                    MetaMask Address
                  </Label>
                  <p
                    style={{ letterSpacing: '0.1rem' }}
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {metamaskAddress.slice(0, 10)}...
                    {metamaskAddress.slice(-4)}
                  </p>
                </div>

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
              }`}
            >
              <CardHeader>
                <CardTitle
                  className={`${
                    theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
                  }`}
                >
                  IPFS Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Connected to IPFS
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
            <CardTitle>
              All Your{' '}
              {fileList.filter((file) => cids.includes(file.cid)).length} Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fileList.length === 0 ? (
              <div>No files uploaded yet.</div>
            ) : (
              <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
                {fileList
                  .filter((file) => cids.includes(file.cid))
                  .map((file, idx) => {
                    const fileType = getFileType(file.key); // Use your existing getFileType function
                    return (
                      <FileBlock
                        key={file.key}
                        id={String(idx)}
                        name={file.key}
                        size={
                          file.size
                            ? `${(file.size / 1024).toFixed(2)} KB`
                            : 'N/A'
                        }
                        type={fileType} // Pass the actual file type instead of null
                        onView={() => handleView(file)}
                        thumbnail={`https://cooperative-salmon-galliform.myfilebase.com/ipfs/${file.cid}`}
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
              file={selectedFile}
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
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                Are you sure?
              </h2>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Do you really want to remove this file?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowRemoveConfirm(false)}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowRemoveConfirm(false);
                    await handleRemoveFile(fileToRemove);
                  }}
                  className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
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
