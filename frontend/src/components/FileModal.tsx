import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { X, Download, FileIcon } from 'lucide-react';

// Import just the core PDF viewer components, not the default layout
import { Viewer, Worker } from '@react-pdf-viewer/core';

// Import just core styles, not default layout styles
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
    cid?: string; // Add cid to the interface
  } | null;
}

const FileModal: React.FC<FileModalProps> = ({ isOpen, onClose, file }) => {
  if (!isOpen || !file) return null;

  // State for PDF loading
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  const renderFilePreview = () => {
    switch (file.type) {
      case 'image':
        // Create URL from CID
        const imageUrl = file.cid
          ? `https://cooperative-salmon-galliform.myfilebase.com/ipfs/${file.cid}`
          : file.thumbnail || '';

        console.log('Displaying image with URL:', imageUrl);

        return (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={imageUrl}
              alt={file.name || file.key}
              className="max-w-full max-h-full object-contain rounded-lg"
              onLoad={() => console.log('Image loaded successfully')}
              onError={(e) => {
                console.error('Image failed to load:', imageUrl);
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwLjUiIHk9IjAuNSIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiByeD0iMiIgZmlsbD0iI2YxZjFmMSIgc3Ryb2tlPSIjZTBlMGUwIi8+PHBhdGggZD0iTTggNiBINiBWMTAgSDEwIFY4IiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==';
              }}
              style={{
                maxHeight: 'calc(100vh - 200px)', // Make sure image fits in the modal
              }}
            />
          </div>
        );

      case 'video':
        const videoUrl = file.cid
          ? `https://cooperative-salmon-galliform.myfilebase.com/ipfs/${file.cid}`
          : file.thumbnail || '';
        console.log('Playing video with URL:', videoUrl);
        return (
          <div className="w-full h-full flex items-center justify-center">
            <ReactPlayer
              url={videoUrl}
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
                console.error('Video failed to load:', videoUrl, e);
              }}
              onReady={() => console.log('Video player is ready')}
            />
          </div>
        );

      case 'audio':
        // Create audio URL from CID
        const audioUrl = file.cid
          ? `https://cooperative-salmon-galliform.myfilebase.com/ipfs/${file.cid}`
          : '';

        console.log('Playing audio with URL:', audioUrl);

        return (
          <div className="flex flex-col items-center justify-center space-y-4 text-center w-full">
            <FileIcon size={80} className="text-purple-600" />
            <div className="w-full max-w-md">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {file.name || file.key}
              </h3>
              <ReactPlayer
                url={audioUrl}
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
                  console.error('Audio failed to load:', audioUrl, e);
                }}
              />
            </div>
          </div>
        );

      case 'pdf':
        // Create PDF URL from CID
        const pdfUrl = file.cid
          ? `https://cooperative-salmon-galliform.myfilebase.com/ipfs/${file.cid}`
          : '';

        console.log('Displaying PDF with URL:', pdfUrl);

        if (!pdfUrl) {
          return (
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <FileIcon size={120} className="text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  PDF Document
                </h3>
                <p className="text-muted-foreground">
                  Could not retrieve PDF URL
                </p>
              </div>
            </div>
          );
        }

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
            {/* Use the matching version 3.11.174 */}
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <div style={{ height: '100%' }}>
                <Viewer
                  fileUrl={pdfUrl}
                  // Remove plugins prop to use the basic viewer
                  onDocumentLoad={() => {
                    setPdfLoaded(true);
                    console.log('PDF loaded successfully');
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

      case 'doc':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <FileIcon size={120} className="text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Document
              </h3>
              <p className="text-muted-foreground">
                Document viewer would be implemented here
              </p>
            </div>
          </div>
        );

      case 'excel':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <FileIcon size={120} className="text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Spreadsheet
              </h3>
              <p className="text-muted-foreground">
                Excel viewer would be implemented here
              </p>
            </div>
          </div>
        );

      case 'ppt':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <FileIcon size={120} className="text-orange-600" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Presentation
              </h3>
              <p className="text-muted-foreground">
                Presentation viewer not found !
              </p>
              <p className="text-muted-foreground">
                Kindly downlaod file to view
              </p>
            </div>
          </div>
        );

      case 'archive':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <FileIcon size={120} className="text-yellow-600" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Archive</h3>
              <p className="text-muted-foreground">
                Archive contents would be listed here
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div
            className={`flex flex-col items-center justify-center space-y-4 text-center`}
          >
            <FileIcon size={120} className="text-muted-foreground" />
            <div>
              <h3
                className={`font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider text-lg font-semibold text-foreground`}
              >
                File Preview
              </h3>
              <p
                className={`font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider mt-2 text-muted-foreground`}
              >
                Preview not available for this file type
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider relative w-[90vw] h-[90vh] bg-background rounded-lg shadow-2xl border`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className={`text-lg font-semibold text-foreground`}>
              {file.name || file.key}
            </h2>
            <p className="text-sm text-muted-foreground">{file.size}</p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Keep the download button */}
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
              title="Download file"
            >
              <Download size={20} />
            </a>
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
        <div className="flex items-center justify-center h-[calc(100%-5rem)] p-4 overflow-auto">
          {renderFilePreview()}
        </div>
      </div>
    </div>
  );
};

export default FileModal;
