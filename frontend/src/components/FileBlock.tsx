import React, { useState } from 'react';
import { FileIcon, Eye, Trash2 } from 'lucide-react';

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
  onView: (file: any) => void;
  onDelete: (id: string) => void;
}

const FileBlock: React.FC<FileBlockProps> = ({
  id,
  name,
  size,
  type,
  thumbnail,
  onView,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const fileConfig = {
    image: {
      color: 'text-blue-500',
      bg: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
    },
    video: {
      color: 'text-red-500',
      bg: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
    },
    pdf: {
      color: 'text-red-600',
      bg: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
    },
    doc: {
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
    },
    excel: {
      color: 'text-green-600',
      bg: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
    },
    ppt: {
      color: 'text-orange-600',
      bg: 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800',
    },
    archive: {
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
    },
    audio: {
      color: 'text-purple-600',
      bg: 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800',
    },
    other: {
      color: 'text-muted-foreground',
      bg: 'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800',
    },
  };

  const config = fileConfig[type] || fileConfig.other;

  const handleView = () => onView({ id, name, size, type, thumbnail });
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div
      className={`relative w-48 h-48 border-2 rounded-lg cursor-pointer transition-all duration-300 overflow-hidden ${
        config.bg
      } ${isHovered ? 'scale-125 shadow-2xl z-10' : 'shadow-sm'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {thumbnail && type === 'image' ? (
          <img
            src={thumbnail}
            alt={name}
            className={`transition-all duration-300 object-cover ${
              isHovered
                ? 'w-full h-full'
                : 'max-w-full max-h-full object-contain rounded'
            }`}
          />
        ) : (
          <div
            className={`transition-all duration-300 ${
              isHovered ? 'scale-125' : ''
            }`}
          >
            <FileIcon size={48} className={config.color} />
          </div>
        )}
      </div>

      {/* Hover overlays */}
      {isHovered && (
        <>
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-background/90 to-transparent px-3 py-2 z-20">
            <div className="text-sm font-medium text-foreground truncate">
              {name}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent px-3 py-2 z-20">
            <div className="flex items-center justify-between">
              <button
                onClick={handleView}
                className="p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
              >
                <Eye size={16} />
              </button>
              <div className="text-xs text-center flex-1 mx-2 text-foreground font-medium">
                {size}
              </div>
              <button
                onClick={handleDelete}
                className="p-2 bg-destructive text-destructive-foreground rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FileBlock;
