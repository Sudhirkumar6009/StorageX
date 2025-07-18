import React, { useState, useEffect } from 'react';
import {
  FileIcon,
  Eye,
  Trash2,
  FileAudio,
  FileVideo,
  File,
  FileText,
  FileChartPie,
  FileSpreadsheet,
  FileArchive,
  Download,
  Loader2,
} from 'lucide-react';
import ReactPlayer from 'react-player';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import {
  fetchAndDecryptFile,
  guessFileType,
  isImageType,
} from '../Utils/DecryptionLogic';
import '@react-pdf-viewer/core/lib/styles/index.css';

interface FileBlockProps {
  id: string;
  name: string;
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
  thumbnail?: string;
  cid?: string;
  onDecrypt?: () => void;
  isEncrypted?: boolean;
  onView: (file: any) => void;
  onDelete: (id: string) => void;
  originalName?: string;
  originalType?: string;
  decryptedUrl?: string;
  isDecrypting?: boolean;
}

const FileBlock: React.FC<FileBlockProps> = ({
  id,
  name,
  size,
  type,
  thumbnail,
  cid,
  onView,
  onDelete,
  onDecrypt,
  isEncrypted = false,
  originalName,
  originalType,
  decryptedUrl: propDecryptedUrl,
  isDecrypting: propIsDecrypting = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(
    propDecryptedUrl || null
  );
  const [decrypting, setDecrypting] = useState(propIsDecrypting);

  // Get the true original name (removing .encrypted extension if needed)
  const trueOriginalName =
    originalName ||
    (isEncrypted && name.endsWith('.encrypted') ? name.slice(0, -10) : name);

  // Get the true file type based on original name
  const trueFileType =
    originalType || (trueOriginalName ? guessFileType(trueOriginalName) : null);

  // Auto-decrypt if file is encrypted and we have the mnemonic
  useEffect(() => {
    if (propDecryptedUrl) {
      setDecryptedUrl(propDecryptedUrl);
      setDecrypting(false);
      return;
    }
    const decryptFileForDisplay = async () => {
      if (isEncrypted && cid) {
        const mnemonic = localStorage.getItem('encrypted_mnemonic');
        if (!mnemonic) return;
        try {
          setDecrypting(true);
          const url = await fetchAndDecryptFile(
            cid,
            mnemonic,
            trueOriginalName,
            trueFileType
          );
          setDecryptedUrl(url);
        } catch (error) {
          console.error('Error decrypting file for display:', error);
          setThumbnailError(true);
        } finally {
          setDecrypting(false);
        }
      }
    };
    decryptFileForDisplay();
    return () => {
      if (decryptedUrl && !propDecryptedUrl) {
        URL.revokeObjectURL(decryptedUrl);
      }
    };
  }, [cid, isEncrypted, trueOriginalName, trueFileType, propDecryptedUrl]);

  const fileConfig = {
    image: {
      color: 'text-blue-500',
      bg: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
      icon: <FileIcon size={48} />,
    },
    video: {
      color: 'text-red-500',
      bg: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
      icon: <FileVideo size={48} />,
    },
    pdf: {
      color: 'text-red-600',
      bg: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
      icon: <File size={48} />,
    },
    doc: {
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
      icon: <FileText size={48} />,
    },
    excel: {
      color: 'text-green-600',
      bg: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
      icon: <FileSpreadsheet size={48} />,
    },
    ppt: {
      color: 'text-orange-600',
      bg: 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800',
      icon: <FileChartPie size={48} />,
    },
    archive: {
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
      icon: <FileArchive size={48} />,
    },
    audio: {
      color: 'text-purple-600',
      bg: 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800',
      icon: <FileAudio size={48} />,
    },
    other: {
      color: 'text-muted-foreground',
      bg: 'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800',
      icon: <FileIcon size={48} />,
    },
  };

  // Improved type detection for encrypted files
  const getDisplayType = () => {
    if (isEncrypted && trueFileType) {
      // If we have a decrypted file, use the original file type to determine display type
      if (trueFileType.startsWith('image/')) return 'image';
      if (trueFileType.startsWith('video/')) return 'video';
      if (trueFileType.startsWith('audio/')) return 'audio';
      if (trueFileType === 'application/pdf') return 'pdf';
    }
    return type; // Fall back to the prop type if not encrypted or no original type
  };

  const displayType = getDisplayType();
  const config = fileConfig[displayType] || fileConfig.other;

  const fileUrl =
    decryptedUrl ||
    (cid && !isEncrypted
      ? `https://cooperative-salmon-galliform.myfilebase.com/ipfs/${cid}`
      : thumbnail || '');

  const handleView = () => {
    let viewType = type;
    if (isEncrypted && decryptedUrl && trueFileType) {
      if (trueFileType.startsWith('image/')) {
        viewType = 'image';
      } else if (trueFileType.startsWith('video/')) {
        viewType = 'video';
      } else if (trueFileType.startsWith('audio/')) {
        viewType = 'audio';
      } else if (trueFileType === 'application/pdf') {
        viewType = 'pdf';
      }
    }
    onView({
      id,
      name: isEncrypted ? trueOriginalName : name,
      size,
      type: viewType,
      thumbnail: decryptedUrl || fileUrl,
      cid,
      key: name,
      isEncrypted,
      originalName: trueOriginalName,
      originalType: trueFileType,
      decryptedUrl,
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  };

  const renderThumbnail = () => {
    if (decrypting) {
      return (
        <div className="flex flex-col items-center justify-center">
          <Loader2 size={48} className="text-blue-500 animate-spin" />
          <div className="mt-2 text-xs font-medium text-center text-blue-500">
            Decrypting...
          </div>
        </div>
      );
    }

    if (thumbnailError) {
      return (
        <div className={`flex items-center justify-center ${config.color}`}>
          {config.icon}
        </div>
      );
    }

    // Check if this is an image - use displayType to correctly identify decrypted images
    if (displayType === 'image' && (decryptedUrl || fileUrl)) {
      const imageSource = decryptedUrl || fileUrl;
      console.log('Rendering image in FileBlock:', {
        url: imageSource,
        originalType: trueFileType,
        isDecrypted: !!decryptedUrl,
      });

      return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          <img
            src={imageSource}
            alt={isEncrypted ? trueOriginalName : name}
            style={{
              transition: 'all 500ms cubic-bezier(0.25, 0.1, 0.25, 1.0)',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
            className={`object-cover ${
              isHovered
                ? 'w-full h-full scale-105'
                : 'max-w-full max-h-full object-contain rounded'
            }`}
            onLoad={() =>
              console.log('Image loaded in FileBlock successfully!')
            }
            onError={(e) => {
              console.error('Image failed to load in FileBlock:', imageSource);
              setThumbnailError(true);
              e.currentTarget.onerror = null;
            }}
          />
        </div>
      );
    }
    if (displayType === 'video' && fileUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full h-full max-h-[200px] overflow-hidden">
            <ReactPlayer
              url={fileUrl}
              controls
              width="100%"
              height="100%"
              light={true}
              config={{
                file: {
                  attributes: {
                    controlsList: 'nodownload',
                  },
                },
              }}
              onError={(e) => {
                console.error('Video failed to load:', fileUrl, e);
                setThumbnailError(true);
              }}
            />
          </div>
        </div>
      );
    }
    if (displayType === 'pdf' && fileUrl) {
      if (!isHovered) {
        return (
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <File size={48} className="text-red-500" />
          </div>
        );
      }
      return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <div
              style={{
                height: '100%',
                width: '100%',
                maxHeight: '220px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Viewer
                fileUrl={fileUrl}
                defaultScale={0.4}
                initialPage={0}
                onDocumentLoad={() => console.log('PDF loaded successfully')}
              />
            </div>
          </Worker>
        </div>
      );
    }
    if (displayType === 'audio' && fileUrl) {
      return (
        <div className="flex flex-col items-center justify-center w-full max-w-[90%]">
          <FileAudio size={48} className="text-purple-600 mb-2" />
          <div className="w-full">
            <ReactPlayer
              url={fileUrl}
              controls
              width="100%"
              height="40px"
              config={{
                file: {
                  forceAudio: true,
                  attributes: {
                    controlsList: 'nodownload',
                  },
                },
              }}
              onError={(e) => {
                console.error('Audio failed to load:', fileUrl, e);
                setThumbnailError(true);
              }}
            />
          </div>
        </div>
      );
    }
    return (
      <div className={`transition-all duration-300 ${config.color}`}>
        {config.icon}
      </div>
    );
  };

  return (
    <div
      className={`relative w-full h-[250px] border-2 rounded-md cursor-pointer overflow-hidden ${
        config.bg
      } ${isHovered ? 'scale-105 shadow-2xl z-10' : 'shadow-sm'}`}
      style={{
        transition: 'all 400ms cubic-bezier(0.25, 0.1, 0.25, 1.0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleView}
    >
      <div
        className={`absolute inset-0 flex items-center justify-center p-1 ${
          isHovered ? 'scale-110' : 'scale-100'
        }`}
        style={{
          transition: 'transform 800ms cubic-bezier(0.25, 0.1, 0.25, 1.0)',
        }}
      >
        {renderThumbnail()}
      </div>

      <div
        className="absolute h-20 top-0 left-0 right-0 bg-gradient-to-b from-background/100 to-background/0 px-4 py-2 z-20"
        style={{
          opacity: isHovered ? 1 : 1,
          transition: 'opacity 900ms cubic-bezier(0.25, 0.1, 0.25, 1.0)',
          pointerEvents: isHovered ? 'auto' : 'none',
        }}
      >
        <div
          className={`text-sm font-medium text-foreground truncate m-2
          font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] text-bold tracking-wider`}
          style={{
            transform: isHovered ? 'translateX(0)' : 'translateX(-10px)',
            transition: 'transform 500ms cubic-bezier(0.25, 0.1, 0.25, 1.0)',
            opacity: 1,
          }}
        >
          {isEncrypted ? trueOriginalName : name}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent px-3 py-2 z-20"
        style={{
          transition: 'opacity 500ms cubic-bezier(0.25, 0.1, 0.25, 1.0)',
          pointerEvents: isHovered ? 'auto' : 'none',
        }}
      >
        <div className="flex items-center justify-between">
          <div
            style={{
              transform: isHovered ? 'translateY(0)' : 'translateY(5px)',
              transition: 'transform 200ms',
            }}
            className={`text-xs font-bold text-center flex-1 mx-2 text-foreground font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider`}
          >
            {size}
          </div>
          <button
            onClick={handleDelete}
            className="p-2 bg-destructive text-destructive-foreground rounded-[30%] shadow-lg hover:scale-110 transition-transform duration-200"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileBlock;
