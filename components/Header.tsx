import React, { useState, useEffect, useRef } from 'react';

interface HeaderProps {
    userName: string | null;
    onManageVibes: () => void;
    onToggleArchived: () => void;
    isArchivedVisible: boolean;
    onExport: () => void;
    onImport: () => void;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ userName, onManageVibes, onToggleArchived, isArchivedVisible, onExport, onImport, onLogout }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuAction = (action: () => void) => {
    action();
    setMenuOpen(false);
  };
  
  const greeting = userName ? `سلام، ${userName.split(' ')[0]}` : 'ایده‌پرداز';

  return (
    <header className="sticky top-0 z-30 p-4 bg-slate-900/50 backdrop-blur-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 
          className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-100 to-slate-400 text-transparent bg-clip-text truncate"
          title={userName ? `سلام، ${userName}` : 'ایده‌پرداز'}
        >
          {greeting}
        </h1>
        <div className="flex items-center gap-2">
           <button 
            onClick={onToggleArchived}
            className={`flex items-center justify-center w-11 h-11 text-xl border rounded-full transition-all text-slate-300 ${
              isArchivedVisible 
              ? 'bg-purple-500/20 border-purple-400 text-purple-300' 
              : 'bg-white/5 border-white/10 hover:bg-white/20'
            }`}
            aria-label="نمایش آرشیو"
          >
            <i className="ph ph-archive"></i>
          </button>
          
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setMenuOpen(prev => !prev)}
              className="flex items-center justify-center w-11 h-11 text-xl bg-white/5 border border-white/10 rounded-full hover:bg-white/20 active:scale-95 transition-all text-slate-300"
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
              aria-label="منوی بیشتر"
            >
              <i className="ph-bold ph-dots-three-vertical"></i>
            </button>
            {isMenuOpen && (
              <div 
                className="absolute left-0 mt-2 w-56 origin-top-left rounded-xl bg-slate-800/80 backdrop-blur-xl border border-white/10 shadow-2xl p-2 z-50 animate-fade-in-up"
                style={{ animationDuration: '0.2s' }}
                role="menu"
              >
                  <button onClick={() => handleMenuAction(onManageVibes)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 rounded-lg hover:bg-white/10 transition-colors" role="menuitem">
                    <i className="ph ph-sparkle text-lg text-purple-300"></i>
                    <span>مدیریت وایب‌ها</span>
                  </button>
                  <div className="h-px bg-white/10 my-1 mx-2"></div>
                  <button onClick={() => handleMenuAction(onExport)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 rounded-lg hover:bg-white/10 transition-colors" role="menuitem">
                    <i className="ph ph-export text-lg text-cyan-300"></i>
                    <span>خروجی گرفتن (Export)</span>
                  </button>
                  <button onClick={() => handleMenuAction(onImport)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 rounded-lg hover:bg-white/10 transition-colors" role="menuitem">
                    <i className="ph ph-import text-lg text-green-300"></i>
                    <span>وارد کردن (Import)</span>
                  </button>
                  <div className="h-px bg-white/10 my-1 mx-2"></div>
                   <button onClick={() => handleMenuAction(onLogout)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 rounded-lg hover:bg-red-500/10 transition-colors" role="menuitem">
                    <i className="ph ph-sign-out text-lg"></i>
                    <span>خروج از حساب</span>
                  </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
