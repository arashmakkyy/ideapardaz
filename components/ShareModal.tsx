import React, { useState, useRef, useCallback } from 'react';
import * as htmlToImage from 'html-to-image';
import type { Idea, Vibe } from '../types';
import Modal from './Modal';
import ShareableIdeaCard from './ShareableIdeaCard';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: Idea;
  vibe: Vibe | undefined;
}

const GRADIENTS = [
  'bg-gradient-to-br from-purple-600 to-blue-500',
  'bg-gradient-to-br from-pink-500 to-orange-400',
  'bg-gradient-to-br from-green-400 to-blue-500',
  'bg-gradient-to-br from-red-500 to-yellow-500',
  'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
  'bg-gradient-to-br from-gray-700 via-gray-900 to-black',
];

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, idea, vibe }) => {
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const processImage = useCallback(async (action: 'download' | 'share') => {
    if (!cardRef.current || isProcessing) return;

    setIsProcessing(true);
    try {
        if (action === 'download') {
            const dataUrl = await htmlToImage.toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `idea-${idea.title.replace(/\s+/g, '-').toLowerCase()}.png`;
            link.href = dataUrl;
            link.click();
        } else if (navigator.share) {
             const blob = await htmlToImage.toBlob(cardRef.current, { quality: 0.95, pixelRatio: 2 });
             if (!blob) throw new Error('Could not create image blob');
             
             const file = new File([blob], `idea.png`, { type: 'image/png' });
             await navigator.share({
                title: idea.title,
                text: idea.content,
                files: [file],
             });
        }
    } catch (err) {
        console.error('oops, something went wrong!', err);
        alert('متاسفانه در تولید عکس مشکلی پیش آمد.');
    } finally {
        setIsProcessing(false);
    }
  }, [idea, isProcessing]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="اشتراک‌گذاری ایده">
      <div className="flex flex-col items-center gap-6">
        <ShareableIdeaCard
          forwardedRef={cardRef}
          idea={idea}
          vibe={vibe}
          className={selectedGradient}
        />
        
        <div>
          <label className="text-slate-300 font-medium mb-2 block text-center">یک استایل انتخاب کن:</label>
          <div className="flex justify-center gap-3 flex-wrap">
            {GRADIENTS.map(gradient => (
              <button
                key={gradient}
                onClick={() => setSelectedGradient(gradient)}
                className={`w-10 h-10 rounded-full ${gradient} border-2 transition-all ${selectedGradient === gradient ? 'border-white' : 'border-transparent'}`}
                aria-label={`انتخاب گرادینت ${gradient}`}
              />
            ))}
          </div>
        </div>

        <div className="w-full flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => processImage('download')}
            disabled={isProcessing}
            className="w-full flex-1 px-6 py-3 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <i className="ph-bold ph-download-simple"></i>
            {isProcessing ? 'در حال پردازش...' : 'دانلود'}
          </button>
          {navigator.share && (
            <button
              onClick={() => processImage('share')}
              disabled={isProcessing}
              className="w-full flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <i className="ph-bold ph-share-network"></i>
              {isProcessing ? '...' : 'اشتراک‌گذاری'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;
