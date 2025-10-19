'use client';

import React, { useState } from 'react';
import { X, Play, Download, Trash2, ZoomIn } from 'lucide-react';
import { Button } from './Button';

interface MediaItem {
  url: string;
  type: 'photo' | 'video';
  thumbnail?: string;
}

interface MediaGalleryProps {
  photos?: string[];
  videos?: string[];
  className?: string;
  showControls?: boolean;
  onDeletePhoto?: (photoUrl: string) => Promise<void>;
  onDeleteVideo?: (videoUrl: string) => Promise<void>;
  maxItems?: number;
  gridCols?: 2 | 3 | 4 | 6;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({
  photos = [],
  videos = [],
  className = '',
  showControls = false,
  onDeletePhoto,
  onDeleteVideo,
  maxItems,
  gridCols = 3
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Combine photos and videos into a single media array
  const mediaItems: MediaItem[] = [
    ...photos.map(url => ({ url, type: 'photo' as const })),
    ...videos.map(url => ({ url, type: 'video' as const }))
  ];

  // Apply maxItems limit if specified
  const displayedItems = maxItems ? mediaItems.slice(0, maxItems) : mediaItems;
  const hasMoreItems = maxItems && mediaItems.length > maxItems;

  const openLightbox = (index: number) => {
    setCurrentMediaIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentMediaIndex(prev => 
        prev === 0 ? displayedItems.length - 1 : prev - 1
      );
    } else {
      setCurrentMediaIndex(prev => 
        prev === displayedItems.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!showControls) return;

    const confirmDelete = window.confirm(
      `Czy na pewno chcesz usunąć ten ${item.type === 'photo' ? 'obraz' : 'film'}?`
    );

    if (!confirmDelete) return;

    setIsDeleting(item.url);

    try {
      if (item.type === 'photo' && onDeletePhoto) {
        await onDeletePhoto(item.url);
      } else if (item.type === 'video' && onDeleteVideo) {
        await onDeleteVideo(item.url);
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Wystąpił błąd podczas usuwania pliku');
    } finally {
      setIsDeleting(null);
    }
  };

  const downloadMedia = (url: string, filename?: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'media-file';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getGridColsClass = () => {
    switch (gridCols) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 6:
        return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  if (displayedItems.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-400 dark:text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-medium text-gray-900 dark:text-white">Brak mediów</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nie dodano jeszcze żadnych zdjęć ani filmów
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Media Grid */}
        <div className={`grid gap-4 ${getGridColsClass()}`}>
          {displayedItems.map((item, index) => (
            <div
              key={`${item.type}-${index}`}
              className="relative group aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              {item.type === 'photo' ? (
                <img
                  src={item.url}
                  alt={`Zdjęcie ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="relative w-full h-full">
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-80" />
                  </div>
                </div>
              )}

              {/* Overlay with controls */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(index);
                    }}
                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    <ZoomIn className="w-4 h-4 text-gray-700" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadMedia(item.url);
                    }}
                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    <Download className="w-4 h-4 text-gray-700" />
                  </button>

                  {showControls && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                      disabled={isDeleting === item.url}
                      className="p-2 bg-red-500 bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* Loading overlay for deletion */}
              {isDeleting === item.url && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Show more indicator */}
        {hasMoreItems && (
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              i {mediaItems.length - maxItems!} więcej...
            </p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && displayedItems.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center p-4">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation buttons */}
            {displayedItems.length > 1 && (
              <>
                <button
                  onClick={() => navigateLightbox('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigateLightbox('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Media content */}
            <div className="max-w-full max-h-full">
              {displayedItems[currentMediaIndex]?.type === 'photo' ? (
                <img
                  src={displayedItems[currentMediaIndex].url}
                  alt={`Zdjęcie ${currentMediaIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video
                  src={displayedItems[currentMediaIndex]?.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full"
                />
              )}
            </div>

            {/* Media counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {currentMediaIndex + 1} / {displayedItems.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MediaGallery;