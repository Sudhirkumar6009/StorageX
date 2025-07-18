import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { X, Download, FileIcon, Lock, Unlock, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { fetchAndDecryptFile, guessFileType } from '../Utils/DecryptionLogic';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

interface FileModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    id: string;
    name: string;
    size: string;
    key: string;
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
    thumbnail?: string;
    cid?: string;
    isEncrypted?: boolean;
    originalName?: string;
    originalType?: string;
    decryptedUrl?: string;
  } | null;
}

const FileModal: React.FC<FileModalProps> = ({ isOpen, onClose, file }) => {
  // All hooks at the top - NO CONDITIONAL LOGIC BEFORE ALL HOOKS
  const contentRef = useRef<HTMLDivElement>(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [mnemonicInput, setMnemonicInput] = useState('');
  const [showMnemonicDialog, setShowMnemonicDialog] = useState(false);
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(null);

  // Initialize decryptedUrl from props when component is mounted
  useEffect(() => {
    if (file?.decryptedUrl) {
      setDecryptedUrl(file.decryptedUrl);
    }
  }, [file?.decryptedUrl]);

  // Auto-decrypt if file is encrypted and we have the mnemonic
  useEffect(() => {
    if (!file) return; // Early return inside the effect is fine

    const isFileEncrypted =
      file.isEncrypted || file.key?.endsWith('.encrypted');
    const originalName =
      file.originalName ||
      (file.key?.endsWith('.encrypted') ? file.key.slice(0, -10) : file.key);
    const originalType =
      file.originalType || (originalName ? guessFileType(originalName) : null);

    if (file.decryptedUrl) {
      setDecryptedUrl(file.decryptedUrl);
      setDecrypting(false);
      return;
    }

    const autoDecryptFile = async () => {
      if (isFileEncrypted && file.cid && !decryptedUrl) {
        const mnemonic = localStorage.getItem('encrypted_mnemonic');
        if (!mnemonic) return;
        try {
          setDecrypting(true);
          const url = await fetchAndDecryptFile(
            file.cid,
            mnemonic,
            originalName,
            originalType
          );
          setDecryptedUrl(url);
        } catch (error) {
          console.error('Auto-decryption error:', error);
        } finally {
          setDecrypting(false);
        }
      }
    };

    autoDecryptFile();

    return () => {
      if (decryptedUrl && decryptedUrl !== file.decryptedUrl) {
        URL.revokeObjectURL(decryptedUrl);
      }
    };
    // eslint-disable-next-line
  }, [file, decryptedUrl]);

  // Now we can have conditional return AFTER all hooks are defined
  if (!isOpen || !file) return null;

  // Define all derived values AFTER hooks but before using them
  const isFileEncrypted = file.isEncrypted || file.key?.endsWith('.encrypted');
  const originalName =
    file.originalName ||
    (file.key?.endsWith('.encrypted') ? file.key.slice(0, -10) : file.key);
  const originalType =
    file.originalType || (originalName ? guessFileType(originalName) : null);
  const fileDisplayUrl =
    decryptedUrl ||
    (!isFileEncrypted && file.cid
      ? `https://cooperative-salmon-galliform.myfilebase.com/ipfs/${file.cid}`
      : file.thumbnail || '');

  // Function to download decrypted file
  const handleDecrypt = async () => {
    setDecrypting(true);
    try {
      let mnemonic = localStorage.getItem('encrypted_mnemonic');
      if (!mnemonic) {
        setShowMnemonicDialog(true);
        setDecrypting(false);
        return;
      }
      await decryptAndDownload(mnemonic);
    } catch (error) {
      console.error('Decryption error:', error);
      toast({
        title: 'Decryption Failed',
        description: error.message || 'Could not decrypt file',
        variant: 'destructive',
      });
      setDecrypting(false);
    }
  };

  const decryptAndDownload = async (mnemonic: string) => {
    if (!file.cid) {
      toast({
        title: 'Error',
        description: 'File CID is missing',
        variant: 'destructive',
      });
      return;
    }
    try {
      let url: string;
      if (decryptedUrl) {
        url = decryptedUrl;
      } else {
        url = await fetchAndDecryptFile(
          file.cid,
          mnemonic,
          originalName,
          originalType
        );
        setDecryptedUrl(url);
      }
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
      toast({
        title: 'File Decrypted',
        description: `Successfully decrypted ${originalName}`,
      });
      if (!localStorage.getItem('encrypted_mnemonic')) {
        localStorage.setItem('encrypted_mnemonic', mnemonic);
      }
      if (showMnemonicDialog) {
        setShowMnemonicDialog(false);
      }
    } catch (error) {
      console.error('Decryption error:', error);
      toast({
        title: 'Decryption Failed',
        description: 'Invalid mnemonic or corrupted file',
        variant: 'destructive',
      });
    } finally {
      setDecrypting(false);
    }
  };

  const handleMnemonicSubmit = async () => {
    if (!mnemonicInput.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your mnemonic phrase',
        variant: 'destructive',
      });
      return;
    }
    await decryptAndDownload(mnemonicInput.trim());
  };

  const renderFilePreview = () => {
    if (decrypting) {
      return (
        <div className="flex flex-col items-center justify-center space-y-6">
          <Loader2 size={80} className="animate-spin text-blue-500" />
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Decrypting File...
            </h3>
            <p className="text-muted-foreground">
              Please wait while we decrypt your file for preview
            </p>
          </div>
        </div>
      );
    }
    if (isFileEncrypted && !decryptedUrl) {
      return (
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-8 rounded-full">
            <Lock size={80} className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Encrypted File
            </h3>
            <p className="text-muted-foreground max-w-md">
              This file is encrypted and cannot be previewed yet. Click the
              "Decrypt" button above or provide your mnemonic phrase to decrypt
              this file.
            </p>
          </div>
        </div>
      );
    }
    switch (file.type) {
      case 'image':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={fileDisplayUrl}
              alt={originalName || file.name}
              className="max-w-full max-h-full object-contain rounded-lg"
              onLoad={() => console.log('Image loaded successfully!')}
              onError={(e) => {
                console.error(
                  'Image failed to load:',
                  fileDisplayUrl,
                  'Type:',
                  originalType
                );
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwLjUiIHk9IjAuNSIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiByeD0iMiIgZmlsbD0iI2YxZjFmMSIgc3Ryb2tlPSIjZTBlMGUwIi8+PHBhdGggZD0iTTggNiBINiBWMTAgSDEwIFY4IiBzdHJva2U9IiM5OTkiIHN0cm9rZVdpZHRoPSIyIi8+PC9zdmc+';
              }}
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            />
          </div>
        );
      case 'video':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <ReactPlayer
              url={fileDisplayUrl}
              controls
              width="100%"
              height="100%"
              style={{ maxHeight: 'calc(100vh - 200px)' }}
              config={{
                file: {
                  attributes: {
                    controlsList: 'nodownload',
                  },
                },
              }}
              onError={(e) => {
                console.error('Video failed to load:', fileDisplayUrl, e);
              }}
            />
          </div>
        );
      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 text-center w-full">
            <FileIcon size={80} className="text-purple-600" />
            <div className="w-full max-w-md">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {originalName || file.name}
              </h3>
              <ReactPlayer
                url={fileDisplayUrl}
                controls
                width="100%"
                height="50px"
                config={{
                  file: {
                    forceAudio: true,
                    attributes: {
                      controlsList: 'nodownload',
                    },
                  },
                }}
                onError={(e) => {
                  console.error('Audio failed to load:', fileDisplayUrl, e);
                }}
              />
            </div>
          </div>
        );
      case 'pdf':
        return (
          <div
            className="w-full h-full"
            style={{
              height: 'calc(100vh - 200px)',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <div style={{ height: '100%' }}>
                <Viewer
                  fileUrl={fileDisplayUrl}
                  onDocumentLoad={() => {
                    setPdfLoaded(true);
                  }}
                />
                {!pdfLoaded && !pdfError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p>Loading PDF...</p>
                  </div>
                )}
                {pdfError && (
                  <div className="flex flex-col items-center justify-center space-y-4 text-center h-full">
                    <FileIcon size={120} className="text-red-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Failed to load PDF
                      </h3>
                      <p className="text-muted-foreground">
                        The PDF file could not be loaded. Try downloading it
                        instead.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Worker>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <FileIcon size={120} className="text-muted-foreground" />
            <div>
              <h3 className="font-['Century_Gothic',CenturyGothic,AppleGothic,sans-serif] tracking-wider text-lg font-semibold text-foreground">
                File Preview
              </h3>
              <p className="font-['Century_Gothic',CenturyGothic,AppleGothic,sans-serif] tracking-wider mt-2 text-muted-foreground">
                Preview not available for this file type
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      style={{ zIndex: 9999 }}
    >
      <div className="font-['Century_Gothic',CenturyGothic,AppleGothic,sans-serif] tracking-wider relative w-[90vw] h-[90vh] bg-background rounded-lg shadow-2xl border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {originalName || file.name || file.key}
            </h2>
            <p className="text-sm text-muted-foreground">{file.size}</p>
            {isFileEncrypted && !decryptedUrl && (
              <div className="flex items-center mt-1 text-amber-500">
                <Lock size={14} className="mr-1" />
                <span className="text-xs">Encrypted File</span>
              </div>
            )}
            {isFileEncrypted && decryptedUrl && (
              <div className="flex items-center mt-1 text-green-500">
                <Unlock size={14} className="mr-1" />
                <span className="text-xs">Decrypted for Preview</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isFileEncrypted && (
              <button
                onClick={handleDecrypt}
                disabled={decrypting}
                className="flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                title={
                  decryptedUrl
                    ? 'Download decrypted file'
                    : 'Decrypt and download'
                }
              >
                {decrypting ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                    {decryptedUrl ? 'Downloading...' : 'Decrypting...'}
                  </span>
                ) : (
                  <>
                    {decryptedUrl ? (
                      <>
                        <Download size={16} className="mr-1" /> Download
                      </>
                    ) : (
                      <>
                        <Unlock size={16} className="mr-1" /> Decrypt
                      </>
                    )}
                  </>
                )}
              </button>
            )}
            {!decryptedUrl && (
              <a
                href={
                  file.cid
                    ? `https://cooperative-salmon-galliform.myfilebase.com/ipfs/${
                        file.cid
                      }?download=true&filename=${file.name || file.key}`
                    : '#'
                }
                download={file.name || file.key}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                title="Download original file (encrypted)"
              >
                <Download size={20} />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        {/* Content */}
        <div
          ref={contentRef}
          className="flex items-center justify-center h-[calc(100%-5rem)] p-4 overflow-auto"
        >
          {renderFilePreview()}
        </div>
      </div>
      {/* Mnemonic Dialog */}
      {showMnemonicDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center text-purple-600">
              Enter Mnemonic Phrase
            </h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              Enter your wallet's mnemonic phrase to decrypt this file. This is
              the same phrase you used when creating your account.
            </p>
            <textarea
              className="w-full p-3 border rounded-md mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
              placeholder="Enter your mnemonic phrase (12 words separated by spaces)"
              value={mnemonicInput}
              onChange={(e) => setMnemonicInput(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowMnemonicDialog(false)}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleMnemonicSubmit}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Decrypt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileModal;
