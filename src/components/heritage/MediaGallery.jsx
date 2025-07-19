import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MediaGallery({ mediaUrls = [], mediaTypes = [] }) {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  const openLightbox = (index) => {
    setSelectedMedia({ url: mediaUrls[index], type: mediaTypes[index] || 'image' });
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
    setIsPlaying(false);
  };

  const nextMedia = () => {
    const nextIndex = (currentIndex + 1) % mediaUrls.length;
    setSelectedMedia({ url: mediaUrls[nextIndex], type: mediaTypes[nextIndex] || 'image' });
    setCurrentIndex(nextIndex);
  };

  const prevMedia = () => {
    const prevIndex = currentIndex === 0 ? mediaUrls.length - 1 : currentIndex - 1;
    setSelectedMedia({ url: mediaUrls[prevIndex], type: mediaTypes[prevIndex] || 'image' });
    setCurrentIndex(prevIndex);
  };

  const renderThumbnail = (url, type, index) => {
    switch (type) {
      case 'image':
        return (
          <img
            src={url}
            alt={`Media ${index + 1}`}
            className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => openLightbox(index)}
          />
        );
      case 'video':
        return (
          <div
            className="w-full h-full bg-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-300 transition-colors relative"
            onClick={() => openLightbox(index)}
          >
            <video src={url} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
        );
      case 'audio':
        return (
          <div
            className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer hover:from-blue-600 hover:to-purple-700 transition-all"
            onClick={() => openLightbox(index)}
          >
            <Volume2 className="w-8 h-8 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
            <span className="text-slate-500 text-sm">Document</span>
          </div>
        );
    }
  };

  const renderFullMedia = (media) => {
    switch (media.type) {
      case 'image':
        return (
          <img
            src={media.url}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
        );
      case 'video':
        return (
          <video
            src={media.url}
            controls
            autoPlay
            muted={isMuted}
            className="max-w-full max-h-full"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        );
      case 'audio':
        return (
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-lg">
            <audio
              src={media.url}
              controls
              autoPlay
              muted={isMuted}
              className="w-full"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <div className="flex items-center justify-center mt-4">
              <Volume2 className="w-16 h-16 text-white opacity-50" />
            </div>
          </div>
        );
      default:
        return (
          <div className="p-8">
            <p className="text-slate-600">Document preview not available</p>
            <a
              href={media.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Open document
            </a>
          </div>
        );
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 text-slate-800">Media Gallery</h3>
      
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mediaUrls.map((url, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="aspect-square">
                {renderThumbnail(url, mediaTypes[index] || 'image', index)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Navigation */}
              {mediaUrls.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                    onClick={prevMedia}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                    onClick={nextMedia}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}

              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={closeLightbox}
              >
                <X className="w-6 h-6" />
              </Button>

              {/* Media Content */}
              <div className="flex items-center justify-center">
                {renderFullMedia(selectedMedia)}
              </div>

              {/* Media Counter */}
              {mediaUrls.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded">
                  {currentIndex + 1} of {mediaUrls.length}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}