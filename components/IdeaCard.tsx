import React, { useState, useRef } from 'react';
import type { Idea, Vibe } from '../types';

interface IdeaCardProps {
  idea: Idea;
  vibe: Vibe | undefined;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
  onShare: (idea: Idea) => void;
  onTogglePin: (id: string) => void;
  ideasMap: Map<string, Idea>;
}

const COLORS = ['#38bdf8', '#2dd4bf', '#d946ef', '#fb7185', '#fbbd23', '#a3e635'];

const getColorForId = (id: string | undefined) => {
  if (!id) return '#64748b'; // slate-500
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % COLORS.length);
  return COLORS[index];
};

const timeAgo = (timestamp: number) => {
  const now = Date.now();
  const seconds = Math.floor((now - timestamp) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return `بیش از ${Math.floor(interval)} سال پیش`;
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)} ماه پیش`;
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)} روز پیش`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)} ساعت پیش`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)} دقیقه پیش`;
  return 'همین الان';
};

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, vibe, onArchive, onUnarchive, onDelete, onShare, onTogglePin, ideasMap }) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const swipeDirection = useRef<'horizontal' | 'vertical' | null>(null);

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (idea.isArchived) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    swipeDirection.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX.current === 0 || idea.isArchived) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startX.current;
    const deltaY = currentY - startY.current;

    if (swipeDirection.current === null) {
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        swipeDirection.current = 'horizontal';
        setIsDragging(true);
      } else if (Math.abs(deltaY) > 10) {
        swipeDirection.current = 'vertical';
      }
    }

    if (swipeDirection.current === 'horizontal') {
      if (e.cancelable) e.preventDefault();
      setDragX(deltaX);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || idea.isArchived) {
      resetSwipeState();
      return;
    }

    const threshold = 80;

    if (dragX < -threshold) { // Swiped left
      onArchive(idea.id);
    } else if (dragX > threshold) { // Swiped right
      onTogglePin(idea.id);
    }
    
    resetSwipeState();
  };
  
  const resetSwipeState = () => {
    setIsDragging(false);
    setDragX(0);
    startX.current = 0;
    startY.current = 0;
    swipeDirection.current = null;
  };

  const vibeColor = getColorForId(vibe?.id);
  const rightActionOpacity = Math.min(1, Math.max(0, -dragX / 80));
  const leftActionOpacity = Math.min(1, Math.max(0, dragX / 80));

  return (
    <div className="relative rounded-3xl overflow-hidden break-inside-avoid animate-fade-in-up mb-4">
        {/* Swipe Action Backgrounds */}
        {!idea.isArchived && (
          <>
            {/* Swipe Left -> Archive */}
            <div className="absolute inset-0 bg-blue-500/80 flex items-center justify-end pr-8" style={{ opacity: rightActionOpacity }}>
              <i className="ph-bold ph-archive text-white text-3xl"></i>
            </div>
            {/* Swipe Right -> Pin */}
            <div className="absolute inset-0 bg-amber-500/80 flex items-center justify-start pl-8" style={{ opacity: leftActionOpacity }}>
              <i className={`ph-bold text-white text-3xl ${idea.isPinned ? 'ph-push-pin-slash' : 'ph-push-pin'}`}></i>
            </div>
          </>
        )}
      
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseLeave={resetSwipeState} // Reset if mouse leaves area
        style={{ transform: `translateX(${dragX}px)` }}
        className={`relative bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex flex-col justify-between shadow-lg h-full transform active:scale-[0.98] z-10 ${idea.isArchived ? 'opacity-70' : ''} ${!isDragging ? 'transition-transform duration-300 ease-out' : ''}`}
      >
        {idea.isPinned && !idea.isArchived && (
          <div className="absolute top-4 left-4 text-amber-300/80" aria-label="پین شده">
            <i className="ph-fill ph-push-pin text-base"></i>
          </div>
        )}
        <div>
          <div className="flex justify-between items-start mb-3">
            <h3 className={`text-xl font-bold text-slate-100 ${idea.isPinned && !idea.isArchived ? 'pl-5' : ''}`}>{idea.title}</h3>
            {idea.isArchived ? (
               <button
                  onClick={(e) => handleAction(e, () => onDelete(idea.id))}
                  className="p-2 -mr-2 -mt-1 rounded-full text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors flex-shrink-0"
                  aria-label="حذف دائمی"
                >
                  <i className="ph-bold ph-trash text-lg"></i>
                </button>
            ) : (
               <div className="flex items-center -mr-2 -mt-1">
                  <button
                    onClick={(e) => handleAction(e, () => onTogglePin(idea.id))}
                    className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                        idea.isPinned
                        ? 'text-amber-400 hover:bg-amber-500/20'
                        : 'text-slate-400 hover:bg-slate-700/50'
                    }`}
                    aria-label={idea.isPinned ? 'برداشتن پین' : 'پین کردن'}
                >
                    <i className={`ph-bold ${idea.isPinned ? 'ph-push-pin-slash' : 'ph-push-pin'} text-lg`}></i>
                  </button>
                  <button
                    onClick={(e) => handleAction(e, () => onArchive(idea.id))}
                    className="p-2 rounded-full text-slate-400 hover:bg-blue-500/20 hover:text-blue-400 transition-colors flex-shrink-0"
                    aria-label="آرشیو کردن"
                  >
                    <i className="ph-bold ph-archive text-lg"></i>
                  </button>
                  <button
                      onClick={(e) => handleAction(e, () => onDelete(idea.id))}
                      className="p-2 rounded-full text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors flex-shrink-0"
                      aria-label="حذف ایده"
                  >
                      <i className="ph-bold ph-trash text-lg"></i>
                  </button>
               </div>
            )}
          </div>
          <p className="text-slate-300 font-light mb-4 whitespace-pre-wrap leading-relaxed">{idea.content}</p>
          
          {idea.linkedIdeaIds && idea.linkedIdeaIds.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-slate-400 mb-2">ایده‌های مرتبط:</h4>
              <div className="flex flex-wrap gap-2">
                {idea.linkedIdeaIds.map(linkedId => {
                  const linkedIdea = ideasMap.get(linkedId);
                  return linkedIdea ? (
                    <span key={linkedId} className="bg-slate-700/50 text-slate-300 text-xs px-2 py-1 rounded-lg">
                      {linkedIdea.title}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-2">
              {idea.isArchived ? (
                  <button 
                      onClick={(e) => handleAction(e, () => onUnarchive(idea.id))} 
                      className="p-2 -ml-2 rounded-full text-green-400 hover:bg-green-500/20 transition-colors flex items-center gap-1.5" 
                      aria-label="بازگردانی از آرشیو"
                  >
                      <i className="ph-bold ph-arrow-u-up-left text-lg"></i>
                      <span className="text-sm font-semibold">بازگردانی</span>
                  </button>
              ) : (
                <>
                  <button 
                      onClick={(e) => handleAction(e, () => onShare(idea))} 
                      className="p-2 -ml-2 rounded-full text-slate-400 hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors" 
                      aria-label="اشتراک‌گذاری ایده"
                  >
                      <i className="ph-bold ph-share-network text-lg"></i>
                  </button>
                  {vibe && (
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: vibeColor }}></div>
                      <span className="text-sm font-medium text-slate-300">{vibe.name}</span>
                    </div>
                  )}
                </>
              )}
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {timeAgo(idea.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default IdeaCard;