import React, { useState } from 'react';
import FileBlock from './FileBlock';
import FileModal from './FileModal';
import { useToast } from '@/hooks/use-toast';

interface FileItem {
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
}

const FileManager: React.FC = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sample files - in a real app, this would come from an API
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'vacation-photos.jpg',
      size: '2.4 MB',
      type: 'image',
      thumbnail:
        'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop',
    },
    {
      id: '2',
      name: 'presentation.pptx',
      size: '5.2 MB',
      type: 'ppt',
    },
    {
      id: '3',
      name: 'report.pdf',
      size: '1.8 MB',
      type: 'pdf',
    },
    {
      id: '4',
      name: 'budget.xlsx',
      size: '847 KB',
      type: 'excel',
    },
    {
      id: '5',
      name: 'demo-video.mp4',
      size: '15.3 MB',
      type: 'video',
    },
    {
      id: '6',
      name: 'contract.docx',
      size: '234 KB',
      type: 'doc',
    },
    {
      id: '7',
      name: 'project-files.zip',
      size: '8.9 MB',
      type: 'archive',
    },
    {
      id: '8',
      name: 'soundtrack.mp3',
      size: '4.1 MB',
      type: 'audio',
    },
    {
      id: '9',
      name: 'landscape.png',
      size: '3.2 MB',
      type: 'image',
      thumbnail:
        'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop',
    },
    {
      id: '10',
      name: 'data-analysis.csv',
      size: '567 KB',
      type: 'other',
    },
    {
      id: '11',
      name: 'profile-pic.jpg',
      size: '1.1 MB',
      type: 'image',
      thumbnail:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    },
    {
      id: '12',
      name: 'meeting-notes.docx',
      size: '189 KB',
      type: 'doc',
    },
    {
      id: '13',
      name: 'backup.tar.gz',
      size: '25.4 MB',
      type: 'archive',
    },
    {
      id: '14',
      name: 'tutorial.mp4',
      size: '18.7 MB',
      type: 'video',
    },
    {
      id: '15',
      name: 'financial-report.pdf',
      size: '2.9 MB',
      type: 'pdf',
    },
  ]);

  const handleView = (file: FileItem) => {
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setFiles(files.filter((file) => file.id !== id));
    toast({
      title: 'File deleted',
      description: 'The file has been successfully deleted.',
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          File Manager
        </h1>
        <p className="text-muted-foreground">
          Hover over files to see details and actions. Click the view button to
          preview files.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {files.map((file) => (
          <FileBlock
            key={file.id}
            id={file.id}
            name={file.name}
            size={file.size}
            type={file.type}
            thumbnail={file.thumbnail}
            onView={handleView}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <FileModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        file={selectedFile}
      />
    </div>
  );
};

export default FileManager;
