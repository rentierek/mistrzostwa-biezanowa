'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Image, Video, FileText, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface MediaUploadProps {
  onPhotoUpload?: (file: File) => Promise<void>;
  onVideoUpload?: (file: File) => Promise<void>;
  onThumbnailUpload?: (file: File) => Promise<void>;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
  uploadType?: 'photo' | 'video' | 'thumbnail' | 'all';
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  onPhotoUpload,
  onVideoUpload,
  onThumbnailUpload,
  acceptedTypes = ['image/*', 'video/*'],
  maxFileSize = 50, // 50MB default
  multiple = true,
  className = '',
  disabled = false,
  uploadType = 'all'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptedTypes = () => {
    switch (uploadType) {
      case 'photo':
        return ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      case 'video':
        return ['video/mp4', 'video/webm', 'video/mov', 'video/avi'];
      case 'thumbnail':
        return ['image/jpeg', 'image/png', 'image/webp'];
      default:
        return acceptedTypes;
    }
  };

  const validateFile = (file: File): string | null => {
    const allowedTypes = getAcceptedTypes();
    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `Nieprawidłowy typ pliku. Dozwolone: ${allowedTypes.join(', ')}`;
    }

    if (file.size > maxFileSize * 1024 * 1024) {
      return `Plik jest za duży. Maksymalny rozmiar: ${maxFileSize}MB`;
    }

    return null;
  };

  const handleFiles = useCallback(async (files: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate files
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    // Show validation errors
    if (errors.length > 0) {
      alert(`Błędy walidacji:\n${errors.join('\n')}`);
    }

    // Process valid files
    for (const file of validFiles) {
      const uploadProgress: UploadProgress = {
        file,
        progress: 0,
        status: 'uploading'
      };

      setUploads(prev => [...prev, uploadProgress]);

      try {
        // Determine upload handler based on file type and upload type
        let uploadHandler: ((file: File) => Promise<void>) | undefined;

        if (uploadType === 'thumbnail' && onThumbnailUpload) {
          uploadHandler = onThumbnailUpload;
        } else if (file.type.startsWith('image/') && onPhotoUpload) {
          uploadHandler = onPhotoUpload;
        } else if (file.type.startsWith('video/') && onVideoUpload) {
          uploadHandler = onVideoUpload;
        }

        if (!uploadHandler) {
          throw new Error('Brak obsługi dla tego typu pliku');
        }

        // Simulate progress (since we don't have real progress from Supabase)
        const progressInterval = setInterval(() => {
          setUploads(prev => prev.map(upload => 
            upload.file === file && upload.status === 'uploading'
              ? { ...upload, progress: Math.min(upload.progress + 10, 90) }
              : upload
          ));
        }, 200);

        await uploadHandler(file);

        clearInterval(progressInterval);
        setUploads(prev => prev.map(upload => 
          upload.file === file 
            ? { ...upload, progress: 100, status: 'completed' }
            : upload
        ));

        // Remove completed uploads after 3 seconds
        setTimeout(() => {
          setUploads(prev => prev.filter(upload => upload.file !== file));
        }, 3000);

      } catch (error) {
        setUploads(prev => prev.map(upload => 
          upload.file === file 
            ? { 
                ...upload, 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Błąd przesyłania'
              }
            : upload
        ));
      }
    }
  }, [disabled, maxFileSize, onPhotoUpload, onVideoUpload, onThumbnailUpload, uploadType]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFiles]);

  const removeUpload = (file: File) => {
    setUploads(prev => prev.filter(upload => upload.file !== file));
  };

  const getUploadTypeLabel = () => {
    switch (uploadType) {
      case 'photo':
        return 'zdjęcia';
      case 'video':
        return 'filmy';
      case 'thumbnail':
        return 'miniaturę';
      default:
        return 'pliki multimedialne';
    }
  };

  const getUploadIcon = () => {
    switch (uploadType) {
      case 'photo':
      case 'thumbnail':
        return <Image className="w-8 h-8 text-gray-400 dark:text-gray-500" />;
      case 'video':
        return <Video className="w-8 h-8 text-gray-400 dark:text-gray-500" />;
      default:
        return <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          bg-white dark:bg-gray-800
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={getAcceptedTypes().join(',')}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled}
        />

        <div className="space-y-4">
          {getUploadIcon()}
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Przeciągnij i upuść {getUploadTypeLabel()} tutaj
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              lub kliknij, aby wybrać pliki
            </p>
          </div>

          <div className="text-xs text-gray-400 dark:text-gray-500">
            <p>Maksymalny rozmiar: {maxFileSize}MB</p>
            <p>Dozwolone formaty: {getAcceptedTypes().join(', ')}</p>
          </div>

          {!disabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Wybierz pliki
            </Button>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Przesyłanie plików
          </h4>
          
          {uploads.map((upload, index) => (
            <div
              key={`${upload.file.name}-${index}`}
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex-shrink-0">
                {upload.file.type.startsWith('image/') ? (
                  <Image className="w-5 h-5 text-blue-500" />
                ) : upload.file.type.startsWith('video/') ? (
                  <Video className="w-5 h-5 text-purple-500" />
                ) : (
                  <FileText className="w-5 h-5 text-gray-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {upload.file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                </p>

                {upload.status === 'uploading' && (
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {upload.status === 'error' && upload.error && (
                  <div className="mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    <p className="text-xs text-red-500">{upload.error}</p>
                  </div>
                )}

                {upload.status === 'completed' && (
                  <p className="text-xs text-green-500 mt-1">Przesłano pomyślnie</p>
                )}
              </div>

              <button
                onClick={() => removeUpload(upload.file)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUpload;