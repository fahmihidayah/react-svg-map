import React, { useRef } from 'react';

interface UploadControlsProps {
  isLoading: boolean;
  onFileUpload: (file: File) => Promise<void>;
}

export const UploadControls: React.FC<UploadControlsProps> = ({ isLoading, onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleUploadClick = (): void => {
    fileInputRef.current?.click();
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={handleUploadClick}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded px-4 py-2 shadow-sm"
      >
        {isLoading ? 'Loading...' : 'Upload SVG'}
      </button>
    </div>
  );
};