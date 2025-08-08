import React, { useState } from 'react';
import { Folder, FolderPlus, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';

export interface FolderItem {
  name: string;
  path: string;
  subfolders?: FolderItem[];
}

interface FolderStructureProps {
  folders: FolderItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
  onCreateFolder: (name: string, path: string) => void;
  className?: string;
}

export const FolderStructure: React.FC<FolderStructureProps> = ({
  folders,
  currentPath,
  onNavigate,
  onCreateFolder,
  className = '',
}) => {
  const { theme } = useTheme();
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [creatingIn, setCreatingIn] = useState<string | null>(null);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleCreateFolder = (parentPath: string) => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), parentPath);
      setNewFolderName('');
      setCreatingIn(null);
    }
  };

  // Find folders for the current level
  const getCurrentLevelFolders = () => {
    // If at root, show top-level folders
    if (!currentPath) {
      return folders.filter(f => f.path !== '' && !f.path.includes('/'));
    }
    
    // Otherwise, show subfolders of the current path
    return folders.filter(folder => {
      const folderPath = folder.path;
      // Folder is direct child of current path
      return folderPath.startsWith(currentPath) && 
             folderPath !== currentPath &&
             folderPath.replace(currentPath, '').split('/').filter(Boolean).length === 1;
    });
  };
  
  const currentFolders = getCurrentLevelFolders();
  
  const renderFolder = (folder: FolderItem, level: number = 0) => {
    const isExpanded = expandedFolders[folder.path] || folder.path === '';
    const isCreating = creatingIn === folder.path;
    const isActive = currentPath === folder.path;
    
    return (
      <div key={folder.path} className="folder-item">
        <div 
          className={`flex items-center py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${
            isActive ? 'bg-blue-100 dark:bg-blue-900' : ''
          }`}
          style={{ paddingLeft: `${level * 12 + 4}px` }}
          onClick={() => {
            onNavigate(folder.path);
            if (folder.subfolders && folder.subfolders.length > 0) {
              toggleFolder(folder.path);
            }
          }}
        >
          {folder.subfolders && folder.subfolders.length > 0 && (
            <button 
              className="mr-1"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.path);
              }}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          <Folder size={16} className="mr-2 text-blue-500" />
          <span className="truncate">{folder.name || 'Root'}</span>
          <button
            className="ml-auto opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              setCreatingIn(folder.path);
            }}
          >
            <FolderPlus size={14} className="text-gray-500 hover:text-blue-500" />
          </button>
        </div>
        
        {isCreating && (
          <div className="flex items-center ml-6 mt-1 mb-1 pr-2" style={{ paddingLeft: `${level * 12 + 4}px` }}>
            <Input 
              size={12}
              value={newFolderName} 
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name" 
              className="text-sm py-1 h-8"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder(folder.path)}
              autoFocus
            />
            <Button 
              size="sm"
              className="ml-2 h-8" 
              onClick={() => handleCreateFolder(folder.path)}
            >
              Create
            </Button>
          </div>
        )}
        
        {isExpanded && folder.subfolders && folder.subfolders.length > 0 && (
          <div className="subfolders">
            {folder.subfolders.map(subfolder => renderFolder(subfolder, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`folder-structure ${className}`}>
      {currentFolders.length === 0 ? (
        <p className="text-sm text-gray-500">No folders found in this location</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {currentFolders.map((folder) => {
            // Extract just the folder name from the path
            const folderName = folder.path.endsWith('/')
              ? folder.path.split('/').filter(Boolean).pop()
              : folder.path.split('/').pop();
              
            return (
              <Button
                key={folder.path}
                variant="outline"
                className={`flex items-center justify-start h-auto py-3 px-3 ${
                  theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
                onClick={() => onNavigate(folder.path)}
              >
                <Folder className="mr-2 h-4 w-4 text-blue-500" />
                <span className="truncate">{folderName}</span>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};