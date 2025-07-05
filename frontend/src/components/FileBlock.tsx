import React, { useState } from 'react';
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
} from 'lucide-react';
import ReactPlayer from 'react-player';
import { Viewer, Worker } from '@react-pdf-viewer/core';

// Import just core styles, not default layout styles
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
  cid?: string; // Add CID to the interface
  onView: (file: any) => void;
  onDelete: (id: string) => void;
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
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

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

  const config = fileConfig[type] || fileConfig.other;

  // Create the file URL from CID
  const fileUrl = cid
    ? `https://cooperative-salmon-galliform.myfilebase.com/ipfs/${cid}`
    : thumbnail || '';

  const handleView = () => {
    onView({
      id,
      name,
      size,
      type,
      thumbnail: fileUrl,
      cid,
      key: name,
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  };

  // Custom thumbnail based on file type
  const renderThumbnail = () => {
    if (thumbnailError) {
      return (
        <div className={`flex items-center justify-center ${config.color}`}>
          {config.icon}
        </div>
      );
    }

    if (type === 'image' && fileUrl) {
      return (
        <img
          src={fileUrl}
          alt={name}
          style={{
            transition: 'all 500ms cubic-bezier(0.25, 0.1, 0.25, 1.0)',
          }}
          className={`object-cover ${
            isHovered
              ? 'w-full h-full scale-105'
              : 'max-w-full max-h-full object-contain rounded'
          }`}
          onError={() => setThumbnailError(true)}
        />
      );
    }

    if (type === 'video' && fileUrl) {
      const videoUrl = cid
        ? `https://cooperative-salmon-galliform.myfilebase.com/ipfs/${cid}`
        : thumbnail || '';

      return (
        <div className="w-full h-full flex items-center justify-center">
          {cid ? (
            <div className="w-full h-full max-h-[200px] overflow-hidden">
              <ReactPlayer
                url={videoUrl}
                controls
                width="100%"
                height="100%"
                light={true} // This adds a thumbnail preview with play button
                config={{
                  file: {
                    attributes: {
                      controlsList: 'nodownload',
                    },
                  },
                }}
                onError={(e) => {
                  console.error('Video failed to load:', videoUrl, e);
                }}
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center">
                <FileVideo size={48} className="text-red-500" />
                <div className="mt-2 text-xs font-medium text-center text-red-500 font-['Century_Gothic',CenturyGothic,AppleGothic,sans-serif] tracking-wider">
                  VIDEO
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    if (type === 'pdf' && fileUrl) {
      const pdfUrl = cid
        ? `https://cooperative-salmon-galliform.myfilebase.com/ipfs/${cid}`
        : '';

      if (!pdfUrl || !isHovered) {
        return (
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <div
                style={{
                  height: '100%',
                  width: '100%',
                  maxHeight: '220px', // Control height to fit in card
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Viewer
                  fileUrl={pdfUrl}
                  defaultScale={0.4} // Smaller scale to fit in card
                  initialPage={0}
                  onDocumentLoad={() => {
                    console.log('PDF loaded successfully');
                  }}
                />
              </div>
            </Worker>
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
                maxHeight: '220px', // Control height to fit in card
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Viewer
                fileUrl={pdfUrl}
                defaultScale={0.4} // Smaller scale to fit in card
                initialPage={0}
                onDocumentLoad={() => {
                  console.log('PDF loaded successfully');
                }}
              />
            </div>
          </Worker>
        </div>
      );
    }

    if (type === 'audio' && fileUrl) {
      const audioUrl = cid
        ? `https://cooperative-salmon-galliform.myfilebase.com/ipfs/${cid}`
        : '';

      console.log('Playing audio with URL:', audioUrl);
      return (
        <div className="flex flex-col items-center justify-center w-full max-w-[90%]">
          <FileAudio size={48} className="text-purple-600 mb-2" />
          <div className="w-full">
            <ReactPlayer
              url={audioUrl}
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
                console.error('Audio failed to load:', audioUrl, e);
              }}
            />
          </div>
        </div>
      );
    }

    // Default icon for other file types
    return (
      <div
        className={`transition-all duration-300 ${config.color} ${
          isHovered ? 'scale-125' : ''
        }`}
      >
        {config.icon}
      </div>
    );
  };

  return (
    <div
      className={`relative w-full h-[250px] border-2 rounded-md cursor-pointer overflow-hidden ${config.bg} $$
      isHovered
        ? 'scale-105 shadow-2xl z-10'
        : 'shadow-sm'
    }`}
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
          {name}
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
