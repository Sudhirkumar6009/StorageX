export const getFileType = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase();
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

export const formatSize = (size: number) => {
  if (size >= 1024 ** 4) {
    return `${(size / 1024 ** 4).toFixed(2)} TB`;
  } else if (size >= 1024 ** 3) {
    return `${(size / 1024 ** 3).toFixed(2)} GB`;
  } else if (size >= 1024 ** 2) {
    return `${(size / 1024 ** 2).toFixed(2)} MB`;
  } else if (size >= 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  }
  return `${size} B`;
};

export const fetchFileSize = (size: number | string) => {
  const kb = Number(size) / 1024;
  if (isNaN(kb)) return 'Unknown';
  return kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
};