import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import FileTypePieChart from '@/components/FileTypePieChart';
import { formatSize } from './utils';

interface VisualizeStorageProps {
  theme: string;
  fileList: any[];
  cids: string[];
  authenticationType: string;
  metamaskAddress: string;
  wcAccount: string;
  user: any;
}

const VisualizeStorage: React.FC<VisualizeStorageProps> = ({
  theme,
  fileList,
  cids,
  authenticationType,
  metamaskAddress,
  wcAccount,
  user,
}) => {
  const totalSize = fileList
    .filter((file) => cids.includes(file.cid))
    .reduce((sum, file) => sum + (Number(file.size) || 0), 0);

  return (
    <Card
      className={`${
        theme === 'dark'
          ? 'bg-gray-900 border-gray-800'
          : 'bg-white border-gray-200'
      } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-widest`}
    >
      <CardHeader>
        <CardTitle
          className={`${
            theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
          } uppercase`}
        >
          Account Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
            Wallet Address
          </Label>
          <p
            style={{ letterSpacing: '0.1rem' }}
            className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {authenticationType === 'metamask' && metamaskAddress
              ? `${metamaskAddress.slice(0, 6)}...${metamaskAddress.slice(-4)}`
              : authenticationType === 'walletConnect' && wcAccount
              ? `${wcAccount.slice(0, 6)}...${wcAccount.slice(-4)}`
              : authenticationType === 'google' && user?.email
              ? user.email
              : ''}
          </p>
        </div>
        <p></p>
        <div>
          <Label className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
            Files Stored:{' '}
            {fileList.filter((file) => cids.includes(file.cid)).length}
          </Label>
          <p
            className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
            }`}
          >
            Uploaded Size: {formatSize(totalSize)}
          </p>
          <FileTypePieChart fileList={fileList} cids={cids} theme={theme} />
        </div>
      </CardContent>
    </Card>
  );
};

export default VisualizeStorage;
