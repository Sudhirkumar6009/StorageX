import React from 'react';
import { X, Download, FileIcon } from 'lucide-react';

interface FileModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
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
  } | null;
}

const FileModal: React.FC<FileModalProps> = ({ isOpen, onClose, file }) => {
  if (!isOpen || !file) return null;

  const renderFilePreview = () => {
    switch (file.type) {
      case 'image':
        return (
          <img
            src={
              file.thumbnail ||
              `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=600&fit=crop`
            }
            alt={file.name}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        );

      case 'video':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <FileIcon size={120} className="text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Video Preview
              </h3>
              <p className="text-muted-foreground">
                Video playback would be implemented here
              </p>
            </div>
          </div>
        );

      case 'pdf':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <FileIcon size={120} className="text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                PDF Document
              </h3>
              <p className="text-muted-foreground">
                PDF viewer would be implemented here
              </p>
            </div>
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
                PowerPoint viewer would be implemented here
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

      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <FileIcon size={120} className="text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Audio File
              </h3>
              <p className="text-muted-foreground">
                Audio player would be implemented here
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <FileIcon size={120} className="text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                File Preview
              </h3>
              <p className="text-muted-foreground">
                Preview not available for this file type
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-[90vw] h-[90vh] bg-background rounded-lg shadow-2xl border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {file.name}
            </h2>
            <p className="text-sm text-muted-foreground">{file.size}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Download size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex items-center justify-center h-[calc(100%-80px)] p-8">
          {renderFilePreview()}
        </div>
      </div>
    </div>
  );
};

export default FileModal;
