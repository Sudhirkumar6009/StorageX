import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';

// Define grayscale color scheme
const grayScaleColors = {
  50: '#00394d', // darkest
  100: '#004d66',
  200: '#006080',
  300: '#007399',
  400: '#1ac6ff',
  500: '#00bfff',
  600: '#33ccff',
  700: '#66d9ff',
  800: '#99e6ff',
  900: '#ccf2ff', // lightest
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to determine file type from extension
const getFileTypeFromExt = (ext) => {
  if (!ext) return 'other';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext))
    return 'image';
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'video';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'doc';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'excel';
  if (['ppt', 'pptx'].includes(ext)) return 'ppt';
  if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext)) return 'archive';
  if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio';
  return 'other';
};

// Function to map file size to a grayscale color (dark for large, light for small)
const mapSizeToColor = (size, minSize, maxSize) => {
  // If there's only one item or min=max, return middle gray
  if (minSize === maxSize) return grayScaleColors[500];

  // Calculate a value between 0 (small) and 900 (large)
  const colorValue = Math.round(((size - minSize) / (maxSize - minSize)) * 900);
  // Invert the value for grayscale (900 = dark, 0 = light)
  const grayLevel = Math.max(50, 900 - colorValue);

  // Find the nearest gray level in our scale
  const levels = [900, 800, 700, 600, 500, 400, 300, 200, 100, 50];
  const nearestLevel = levels.reduce((prev, curr) =>
    Math.abs(curr - grayLevel) < Math.abs(prev - grayLevel) ? curr : prev
  );

  return grayScaleColors[nearestLevel];
};

export default function FileTypePieChart({ fileList, cids, theme }) {
  // Calculate size for each file type
  const calculateFileSizes = () => {
    const sizeByType = {
      image: 0,
      video: 0,
      pdf: 0,
      doc: 0,
      excel: 0,
      ppt: 0,
      archive: 0,
      audio: 0,
      other: 0,
    };

    fileList
      .filter((file) => cids.includes(file.cid))
      .forEach((file) => {
        const size = Number(file.size) || 0;
        let fileType = 'other';

        // Handle encrypted files
        if (file.key?.endsWith('.encrypted')) {
          // Use originalName if available
          if (file.originalName) {
            const ext = file.originalName.split('.').pop()?.toLowerCase();
            fileType = getFileTypeFromExt(ext);
          } else {
            // Otherwise extract original name from the key (remove .encrypted suffix)
            const originalName = file.key.slice(0, -10);
            const ext = originalName.split('.').pop()?.toLowerCase();
            fileType = getFileTypeFromExt(ext);
          }
        } else if (file.key) {
          // For non-encrypted files
          const ext = file.key.split('.').pop()?.toLowerCase();
          fileType = getFileTypeFromExt(ext);
        }

        // Add size to the appropriate category
        sizeByType[fileType] += size;
      });

    // Convert to array and filter out zero sizes
    const sizeArray = Object.entries(sizeByType)
      .filter(([_, size]) => size > 0)
      .map(([type, size]) => ({
        id: type,
        label: type.toUpperCase(),
        value: size,
      }));

    // Find min and max sizes to establish the color range
    const sizes = sizeArray.map((item) => item.value);
    const minSize = Math.min(...sizes);
    const maxSize = Math.max(...sizes);

    // Sort by size (largest first) and add color based on size
    return sizeArray
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({
        ...item,
        color: mapSizeToColor(item.value, minSize, maxSize),
      }));
  };

  const chartData = calculateFileSizes();

  // Calculate total size for percentage
  const totalSize = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom value formatter for tooltip
  const valueFormatter = (item) =>
    `${formatFileSize(item.value)} (${((item.value / totalSize) * 100).toFixed(
      1
    )}%)`;

  // If no data, show a placeholder
  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px]">
        <p className="text-muted-foreground text-sm">No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <PieChart
        series={[
          {
            data: chartData,
            highlightScope: { fade: 'global', highlight: 'item' },
            faded: {
              innerRadius: 60,
              additionalRadius: -10,
            },
            valueFormatter,
            innerRadius: 50,
            arcLabelMinAngle: 25,
          },
        ]}
        strokeOpacity={0}
        height={240}
        width={300}
        margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
        sx={{
          [`& .MuiChartsLegend-root`]: {
            display: 'flex',
            flexDirection: 'column',
            border: 'none',
            alignItems: 'flex-start',
          },
          [`& .MuiChartsLegend-label`]: {
            color: theme === 'dark' ? '#ffffff' : '#374151',
            fontSize: '0.75rem',
            border: 'none',
            fontFamily:
              '"Century Gothic", CenturyGothic, AppleGothic, sans-serif',
          },
          // Remove borders from pie slices
          '& .MuiChartsArc-sector': {
            stroke: 'transparent !important',
            strokeWidth: '0 !important',
            border: 'none !important',
          },
          // Make sure highlight doesn't add border
          '& .MuiChartsArc-root:hover .MuiChartsArc-sector': {
            stroke: 'transparent !important',
            strokeWidth: '0 !important',
          },
        }}
      />

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs w-full px-4">
        {chartData.map((item) => (
          <div key={item.id} className="flex items-center">
            <span
              className="w-3 h-3 mr-1.5 inline-block rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span
              className={`${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              {item.label}: {formatFileSize(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
