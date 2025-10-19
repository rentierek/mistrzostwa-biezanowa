'use client';

import { useState, useRef } from 'react';

interface PhotoUploadProps {
  currentPhotoUrl?: string;
  playerName: string;
  onPhotoChange: (file: File | null) => void;
  isUploading?: boolean;
}

export default function PhotoUpload({ 
  currentPhotoUrl, 
  playerName, 
  onPhotoChange, 
  isUploading = false 
}: PhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onPhotoChange(file);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative group">
      {/* Photo Display */}
      <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden relative">
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt={playerName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl font-bold text-gray-300">
            {playerName.charAt(0).toUpperCase()}
          </span>
        )}
        
        {/* Upload Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          {isUploading ? (
            <div className="text-white text-xs">Uploading...</div>
          ) : (
            <div className="text-white text-xs text-center">
              <div>📷</div>
              <div>Change</div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Controls */}
      <div className="absolute -bottom-2 -right-2 flex space-x-1">
        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-full p-2 text-xs shadow-lg transition-colors"
          title="Upload photo"
        >
          📷
        </button>
        
        {previewUrl && (
          <button
            onClick={handleRemovePhoto}
            disabled={isUploading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-full p-2 text-xs shadow-lg transition-colors"
            title="Remove photo"
          >
            🗑️
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}