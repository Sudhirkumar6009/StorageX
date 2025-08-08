import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import {
  FileIcon,
  FileAudio,
  FileVideo,
  File,
  FileText,
  FileSpreadsheet,
  FileArchive,
} from 'lucide-react';

interface PreviewSelectionFileProps {
  previewFile: any | null;
  theme: string;
}

const PreviewSelectionFile: React.FC<PreviewSelectionFileProps> = ({
  previewFile,
  theme,
}) => {
  return (
    <Card
      className={`mt-6 ${
        theme === 'dark'
          ? 'bg-gray-900 border-gray-800'
          : 'bg-white border-gray-200'
      } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wide`}
    >
      <CardHeader>
        <CardTitle
          className={`${
            theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
          } uppercase tracking-wider`}
        >
          Preview File
        </CardTitle>
      </CardHeader>

      <CardContent>
        {!previewFile ? (
          <p className="text-muted-foreground text-center py-8">
            Select a file to preview
          </p>
        ) : previewFile.isLocal ? (
          <div className="space-y-4">
            {/* Preview for locally selected file */}
            <div className="flex items-center justify-center mb-4 h-48">
              {previewFile.type === 'image' ? (
                <img
                  src={previewFile.previewUrl}
                  alt={previewFile.name}
                  className="max-h-48 object-contain rounded-md shadow-md"
                />
              ) : previewFile.type === 'video' ? (
                <video
                  src={previewFile.previewUrl}
                  controls
                  className="max-h-48 max-w-full"
                />
              ) : previewFile.type === 'pdf' ? (
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                  <div
                    style={{
                      height: '100%',
                      width: '100%',
                      maxHeight: '200px',
                    }}
                  >
                    <Viewer fileUrl={previewFile.previewUrl} />
                  </div>
                </Worker>
              ) : previewFile.type === 'audio' ? (
                <div className="flex flex-col items-center">
                  <FileAudio size={48} className="text-purple-600 mb-2" />
                  <audio
                    src={previewFile.previewUrl}
                    controls
                    className="w-full max-w-[250px]"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  {previewFile.type === 'doc' && (
                    <FileText size={64} className="text-blue-600" />
                  )}
                  {previewFile.type === 'excel' && (
                    <FileSpreadsheet size={64} className="text-green-600" />
                  )}
                  {previewFile.type === 'ppt' && (
                    <FileIcon size={64} className="text-orange-600" />
                  )}
                  {previewFile.type === 'archive' && (
                    <FileArchive size={64} className="text-yellow-600" />
                  )}
                  {(previewFile.type === 'other' ||
                    !['doc', 'excel', 'ppt', 'archive'].includes(
                      previewFile.type
                    )) && <FileIcon size={64} className="text-gray-500" />}
                </div>
              )}
            </div>

            {/* File info */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Name
                </h4>
                <p className="text-foreground truncate">{previewFile.name}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Size
                </h4>
                <p className="text-foreground">{previewFile.size}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Type
                </h4>
                <p className="text-foreground capitalize">{previewFile.type}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Last Modified
                </h4>
                <p className="text-foreground">{previewFile.lastModified}</p>
              </div>
            </div>
          </div>
        ) : (
          <p>No file selected</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PreviewSelectionFile;
