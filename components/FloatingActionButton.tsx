import React from 'react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  const handleClick = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50); // Short and crisp vibration
    }
    onClick();
  };
  
  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 end-6 z-40 w-14 h-14 text-white flex items-center justify-center transform active:scale-90 transition-transform clip-hexagon bg-gradient-to-br from-fuchsia-600 via-purple-600 to-pink-600 shadow-[inset_0_2px_2px_rgba(255,255,255,0.4),inset_0_-2px_2px_rgba(0,0,0,0.2),0_10px_20px_-5px_rgba(168,85,247,0.4)]"
      aria-label="افزودن ایده جدید"
    >
      <i className="ph-bold ph-plus text-3xl" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}></i>
    </button>
  );
};

export default FloatingActionButton;