import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FileBlock from '@/components/FileBlock';
import { getFileType, formatSize } from './utils';

interface FilesListProps {
  fileList: any[];
  cids: string[];
  decryptedUrls: Record<string, string>;
  isDecrypting: Record<string, boolean>;
  onViewFile: (file: any) => void;
  onRemoveFile: (file: any) => void;
  onDecryptFile: (file: any) => void;
}

const FilesList: React.FC<FilesListProps> = ({
  fileList,
  cids,
  decryptedUrls,
  isDecrypting,
  onViewFile,
  onRemoveFile,
  onDecryptFile,
}) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="font-['Century_Gothic',CenturyGothic,AppleGothic,sans-serif] tracking-wider">
          {fileList.filter((file) => cids.includes(file.cid)).length} Files
          Found
        </CardTitle>
      </CardHeader>
      <CardContent>
        {fileList.length === 0 && cids.length > 0 ? (
          <div className="font-['Century_Gothic',CenturyGothic,AppleGothic,sans-serif] tracking-wider">
            No files uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {fileList
              .filter((file) => cids.includes(file.cid))
              .map((file, idx) => {
                const fileType = getFileType(file.key);
                const isEncrypted = file.key.endsWith('.encrypted');
                const originalName = isEncrypted
                  ? file.key.slice(0, -10)
                  : file.key;
                return (
                  <FileBlock
                    key={file.key}
                    id={String(idx)}
                    name={file.key}
                    size={file.size ? formatSize(Number(file.size)) : 'N/A'}
                    type={fileType}
                    cid={file.cid}
                    onView={() =>
                      onViewFile({
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
                    onDelete={() => onRemoveFile(file)}
                    onDecrypt={() => onDecryptFile(file)}
                    isEncrypted={isEncrypted}
                    originalName={originalName}
                    originalType={file.originalType}
                    decryptedUrl={decryptedUrls[file.cid]}
                    isDecrypting={isDecrypting[file.cid]}
                  />
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilesList;
