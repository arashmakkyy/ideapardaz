import React from 'react';
import type { Idea, Vibe } from '../types';

interface ShareableIdeaCardProps {
  idea: Idea;
  vibe: Vibe | undefined;
  className?: string;
  forwardedRef: React.Ref<HTMLDivElement>;
}

const ShareableIdeaCard: React.FC<ShareableIdeaCardProps> = ({ idea, vibe, className, forwardedRef }) => {
  return (
    <div
      ref={forwardedRef}
      className={`w-full max-w-md aspect-[9/16] rounded-3xl p-8 flex flex-col text-white shadow-2xl ${className}`}
    >
      <div className="flex-grow flex flex-col justify-center items-center text-center">
        {vibe && (
            <div className="mb-4 text-lg font-semibold bg-black/20 px-4 py-1.5 rounded-full">
                {vibe.name}
            </div>
        )}
        <h2 className="text-4xl font-black leading-tight tracking-tight mb-4">{idea.title}</h2>
        <p className="text-lg font-light opacity-80 leading-relaxed">{idea.content}</p>
      </div>
      <div className="text-center text-lg font-bold opacity-60 text-white/80">
        ایده‌پرداز
      </div>
    </div>
  );
};

export default ShareableIdeaCard;
