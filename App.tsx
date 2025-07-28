import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Idea, Vibe } from './types';
import Header from './components/Header';
import IdeaCard from './components/IdeaCard';
import FloatingActionButton from './components/FloatingActionButton';
import Modal from './components/Modal';
import IdeaForm from './components/IdeaForm';
import CategoryManager from './components/CategoryManager';
import ShareModal from './components/ShareModal';

const DEFAULT_VIBES: Vibe[] = [
  { id: '1', name: '🚀 پروژه' },
  { id: '2', name: '🤔 فکر خام' },
  { id: '3', name: '💡 لامپ' },
];

// Helper to read from localStorage safely
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading storage key "${key}":`, error);
    return defaultValue;
  }
};


const App: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>(() => loadFromStorage('ideas', []));
  const [vibes, setVibes] = useState<Vibe[]>(() => loadFromStorage('vibes', DEFAULT_VIBES));
  const [isIdeaModalOpen, setIdeaModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [ideaToShare, setIdeaToShare] = useState<Idea | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Effect to save ideas to localStorage whenever they change
  useEffect(() => {
    try {
      window.localStorage.setItem('ideas', JSON.stringify(ideas));
    } catch (error) {
      console.error('Error saving ideas to localStorage:', error);
    }
  }, [ideas]);

  // Effect to save vibes to localStorage whenever they change
  useEffect(() => {
    try {
      window.localStorage.setItem('vibes', JSON.stringify(vibes));
    } catch (error) {
      console.error('Error saving vibes to localStorage:', error);
    }
  }, [vibes]);


  const vibesMap = useMemo(() => new Map(vibes.map(vibe => [vibe.id, vibe])), [vibes]);
  const ideasMap = useMemo(() => new Map(ideas.map(idea => [idea.id, idea])), [ideas]);

  const addIdea = (ideaData: Omit<Idea, 'id' | 'timestamp'>) => {
    const newIdea: Idea = {
      ...ideaData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      isArchived: false,
      isPinned: false,
    };

    setIdeas(currentIdeas => {
        let updatedIdeas = [newIdea, ...currentIdeas];
        // Create two-way links
        if (newIdea.linkedIdeaIds && newIdea.linkedIdeaIds.length > 0) {
          updatedIdeas = updatedIdeas.map(idea => {
            if (newIdea.linkedIdeaIds!.includes(idea.id)) {
              const newLinkedIds = new Set([...(idea.linkedIdeaIds || []), newIdea.id]);
              return { ...idea, linkedIdeaIds: Array.from(newLinkedIds) };
            }
            return idea;
          });
        }
        return updatedIdeas;
    });

    if (navigator.vibrate) navigator.vibrate(50);
  };

  const archiveIdea = (id: string) => {
    setIdeas(prevIdeas => prevIdeas.map(idea => idea.id === id ? { ...idea, isArchived: true, isPinned: false } : idea));
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const unarchiveIdea = (id: string) => {
    setIdeas(prevIdeas => prevIdeas.map(idea => idea.id === id ? { ...idea, isArchived: false } : idea));
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const deleteIdea = (idToDelete: string) => {
    setIdeas(currentIdeas => 
        currentIdeas.reduce((acc, idea) => {
            // If it's the idea to be deleted, skip it by not adding it to the accumulator.
            if (idea.id === idToDelete) {
                return acc;
            }

            // For all other ideas, check if they are linked to the deleted idea.
            if (idea.linkedIdeaIds?.includes(idToDelete)) {
                // If so, add a new version of the idea with the link removed.
                acc.push({
                    ...idea,
                    linkedIdeaIds: idea.linkedIdeaIds.filter(linkId => linkId !== idToDelete),
                });
            } else {
                // Otherwise, add the idea as is.
                acc.push(idea);
            }
            return acc;
        }, [] as Idea[])
    );
    
    if (navigator.vibrate) navigator.vibrate(100);
  };

  const togglePinIdea = (id: string) => {
    setIdeas(prevIdeas =>
      prevIdeas.map(idea => (idea.id === id ? { ...idea, isPinned: !idea.isPinned } : idea))
    );
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const addVibe = (name: string) => {
    const newVibe: Vibe = { id: crypto.randomUUID(), name };
    setVibes(prev => [...prev, newVibe]);
  };

  const deleteVibe = (id: string) => {
    if (DEFAULT_VIBES.some(v => v.id === id)) return;
    if (ideas.some(idea => idea.vibeId === id)) {
      alert('نمی‌توانید وایبی که برای یک ایده استفاده شده را حذف کنید.');
      return;
    }
    setVibes(prevVibes => prevVibes.filter(vibe => vibe.id !== id));
  };
  
  const handleExportData = () => {
    try {
      const dataToExport = { vibes, ideas };
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `ideapardaz_backup_${timestamp}.json`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      if (navigator.vibrate) navigator.vibrate(50);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('خطا در خروجی گرفتن اطلاعات.');
    }
  };

  const handleImportClick = () => {
    importFileRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error('File content is not text.');
        const data = JSON.parse(text);

        if (!data || !Array.isArray(data.ideas) || !Array.isArray(data.vibes)) {
          throw new Error('Invalid JSON structure.');
        }

        const isConfirmed = window.confirm(
          'آیا مطمئن هستید؟ با این کار تمام اطلاعات فعلی شما بازنویسی خواهد شد.'
        );
        
        if (isConfirmed) {
          setVibes(data.vibes);
          setIdeas(data.ideas);
          if (navigator.vibrate) navigator.vibrate([100, 30, 100]);
          alert('اطلاعات با موفقیت وارد شد!');
        }
      } catch (error) {
        console.error('Failed to import data:', error);
        alert('فایل نامعتبر است یا ساختار درستی ندارد. لطفاً فایل خروجی گرفته شده از همین اپلیکیشن را انتخاب کنید.');
      } finally {
        if (event.target) {
            event.target.value = '';
        }
      }
    };
    reader.onerror = () => {
        alert('خطا در خواندن فایل.');
    };
    reader.readAsText(file);
  };


  const { activeIdeas, archivedIdeas } = useMemo(() => {
    const allActive = ideas.filter(idea => !idea.isArchived);
    const allArchived = ideas.filter(idea => idea.isArchived).sort((a, b) => b.timestamp - a.timestamp);

    allActive.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.timestamp - a.timestamp;
    });

    return {
      activeIdeas: allActive,
      archivedIdeas: allArchived,
    };
  }, [ideas]);

  const handleShare = (idea: Idea) => setIdeaToShare(idea);

  return (
    <div className="min-h-screen">
      <input
        type="file"
        ref={importFileRef}
        onChange={handleFileChange}
        accept="application/json"
        className="hidden"
        aria-hidden="true"
      />
      <Header 
        onManageVibes={() => setCategoryModalOpen(true)}
        onToggleArchived={() => setShowArchived(prev => !prev)}
        isArchivedVisible={showArchived}
        onExport={handleExportData}
        onImport={handleImportClick}
      />

      <main className="container mx-auto p-4 pb-24">
        {ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 animate-fade-in-up">
            <i className="ph-light ph-drop text-7xl text-purple-400 opacity-50 mb-6"></i>
            <h2 className="text-2xl font-bold text-white">ذهنت رو جاری کن...</h2>
            <p className="text-slate-400 mt-2 max-w-sm">ایده‌ها مثل قطره‌های باران هستند. اولین قطره را با دکمه درخشان پایین صفحه اضافه کن.</p>
          </div>
        ) : activeIdeas.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {activeIdeas.map(idea => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                vibe={vibesMap.get(idea.vibeId)}
                onArchive={archiveIdea}
                onUnarchive={unarchiveIdea}
                onDelete={deleteIdea}
                onShare={handleShare}
                onTogglePin={togglePinIdea}
                ideasMap={ideasMap}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20 animate-fade-in-up">
            <i className="ph-light ph-books text-7xl text-purple-400 opacity-50 mb-6"></i>
            <h2 className="text-2xl font-bold text-white">ایده فعالی نیست</h2>
            <p className="text-slate-400 mt-2 max-w-sm">برای دیدن ایده‌های بایگانی شده، دکمه آرشیو را در بالا بزنید.</p>
          </div>
        )}

        {showArchived && (
          <>
            <div className="my-8 text-center">
              <h2 className="text-2xl font-bold text-slate-300 border-t border-b border-white/10 py-3 tracking-widest">
                آرشیو
              </h2>
            </div>
            {archivedIdeas.length > 0 ? (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                {archivedIdeas.map(idea => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    vibe={vibesMap.get(idea.vibeId)}
                    onArchive={archiveIdea}
                    onUnarchive={unarchiveIdea}
                    onDelete={deleteIdea}
                    onShare={handleShare}
                    onTogglePin={togglePinIdea}
                    ideasMap={ideasMap}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-10 animate-fade-in-up">
                <i className="ph-light ph-archive text-6xl text-purple-400 opacity-50 mb-6"></i>
                <h2 className="text-xl font-bold text-white">آرشیو خالی است.</h2>
                <p className="text-slate-400 mt-2">ایده‌هایی که آرشیو می‌کنید اینجا نمایش داده می‌شوند.</p>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="text-center p-6 text-slate-500 text-sm">
          ساخته شده توسط A.M code
      </footer>

      <FloatingActionButton onClick={() => setIdeaModalOpen(true)} />

      <Modal isOpen={isIdeaModalOpen} onClose={() => setIdeaModalOpen(false)} title="ایده جدید">
        <IdeaForm
          onSave={addIdea}
          vibes={vibes}
          allIdeas={activeIdeas}
          onClose={() => setIdeaModalOpen(false)}
        />
      </Modal>
      
      <Modal isOpen={isCategoryModalOpen} onClose={() => setCategoryModalOpen(false)} title="مدیریت وایب‌ها">
        <CategoryManager
            categories={vibes}
            onAdd={addVibe}
            onDelete={deleteVibe}
        />
      </Modal>

      {ideaToShare && (
        <ShareModal
            isOpen={!!ideaToShare}
            onClose={() => setIdeaToShare(null)}
            idea={ideaToShare}
            vibe={vibesMap.get(ideaToShare.vibeId)}
        />
      )}
    </div>
  );
};

export default App;
