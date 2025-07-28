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
<<<<<<< HEAD
    try {
      window.localStorage.setItem('ideas', JSON.stringify(ideas));
    } catch (error) {
      console.error('Error saving ideas to localStorage:', error);
=======
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // User is logged in. Fetch their profile from Firestore to get the full name.
        const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
        const displayName = userDoc.exists ? userDoc.data()?.displayName : firebaseUser.displayName;
        setUser({ ...firebaseUser, displayName });
      } else {
        // User is logged out.
        setUser(null);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      // Subscribe to vibes
      const vibesRef = db.collection('users').doc(user.uid).collection('vibes');
      const unsubscribeVibes = vibesRef.onSnapshot(snapshot => {
        const userVibes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Vibe[];
        // The source of truth is Firestore. If it's empty, it's empty.
        // A new user has default vibes created for them in LoginScreen.
        setVibes(userVibes);
      });
      
      // Subscribe to ideas
      const unsubscribeIdeas = db.collection('users').doc(user.uid).collection('ideas')
        .onSnapshot(snapshot => {
          const userIdeas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Idea[];
          setIdeas(userIdeas);
        });

      return () => {
        unsubscribeVibes();
        unsubscribeIdeas();
      };
    } else {
      // Clear data on logout
      setIdeas([]);
      setVibes(DEFAULT_VIBES);
>>>>>>> 3a082df2ab9d4b583993143b228928c8b7d54ea1
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

<<<<<<< HEAD
  const addIdea = (ideaData: Omit<Idea, 'id' | 'timestamp'>) => {
=======
  const addIdea = async (ideaData: Omit<Idea, 'id' | 'timestamp'>): Promise<void> => {
    if (!ideasCollectionRef) {
      throw new Error("User is not authenticated. Cannot add idea.");
    }

    // 1. Create a new document reference to get a unique ID upfront.
    const newIdeaRef = ideasCollectionRef.doc();
    
    // 2. Create the full new idea object for the optimistic update.
>>>>>>> 3a082df2ab9d4b583993143b228928c8b7d54ea1
    const newIdea: Idea = {
      id: newIdeaRef.id,
      ...ideaData,
      timestamp: Date.now(),
      isArchived: false,
      isPinned: false,
    };
    
    // 3. Prepare the data for Firestore (without the 'id' field).
    const { id, ...ideaToSave } = newIdea;

<<<<<<< HEAD
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
=======
    try {
      const batch = db.batch();

      batch.set(newIdeaRef, ideaToSave);

      // Atomically update linked ideas to create a two-way link
      if (ideaToSave.linkedIdeaIds && ideaToSave.linkedIdeaIds.length > 0) {
        // @ts-ignore - 'firebase' is a global from CDN
        const FieldValue = firebase.firestore.FieldValue;
        ideaToSave.linkedIdeaIds.forEach(linkedId => {
          const linkedIdeaRef = ideasCollectionRef.doc(linkedId);
          batch.update(linkedIdeaRef, { linkedIdeaIds: FieldValue.arrayUnion(newIdeaRef.id) });
        });
      }
      
      await batch.commit();

      // 4. Optimistically update the local state IMMEDIATELY after successful commit.
      setIdeas(currentIdeas => [newIdea, ...currentIdeas]);
      
      if (navigator.vibrate) navigator.vibrate(50);
    } catch (error) {
      console.error("Error committing new idea to Firestore:", error);
      // Re-throw the error to be caught by the calling component (IdeaForm)
      throw error;
    }
  };
  
  const archiveIdea = (id: string) => ideasCollectionRef?.doc(id).update({ isArchived: true, isPinned: false });
  const unarchiveIdea = (id: string) => ideasCollectionRef?.doc(id).update({ isArchived: false });
  const togglePinIdea = (id: string) => {
    const idea = ideas.find(i => i.id === id);
    if(idea) ideasCollectionRef?.doc(id).update({ isPinned: !idea.isPinned });
  };
  
  const deleteIdea = async (idToDelete: string) => {
    if (!ideasCollectionRef) return;
    try {
      const batch = db.batch();

      // Before deleting, query for all ideas that link to this one and remove the link.
      // This prevents dangling references in the database.
      const linkedFromSnapshot = await ideasCollectionRef.where('linkedIdeaIds', 'array-contains', idToDelete).get();
      
      if (!linkedFromSnapshot.empty) {
        // @ts-ignore - 'firebase' is a global from CDN
        const FieldValue = firebase.firestore.FieldValue;
        linkedFromSnapshot.forEach(doc => {
          batch.update(doc.ref, { linkedIdeaIds: FieldValue.arrayRemove(idToDelete) });
        });
      }

      // Now, delete the idea itself.
      batch.delete(ideasCollectionRef.doc(idToDelete));

      await batch.commit();
      if (navigator.vibrate) navigator.vibrate(100);

    } catch (error) {
      console.error('Error deleting idea:', error);
      alert('خطا در حذف ایده. لطفاً دوباره تلاش کنید.');
    }
  };

  const addVibe = (name: string) => {
    if (!vibesCollectionRef) return;
    const newVibeRef = vibesCollectionRef.doc();
    newVibeRef.set({ name });
>>>>>>> 3a082df2ab9d4b583993143b228928c8b7d54ea1
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
<<<<<<< HEAD
          setVibes(data.vibes);
          setIdeas(data.ideas);
          if (navigator.vibrate) navigator.vibrate([100, 30, 100]);
          alert('اطلاعات با موفقیت وارد شد!');
=======
            const batch = db.batch();
            // Delete old data
            (await ideasCollectionRef.get()).docs.forEach(doc => batch.delete(doc.ref));
            (await vibesCollectionRef.get()).docs.forEach(doc => batch.delete(doc.ref));
            // Add new data
            data.vibes.forEach((vibe: Vibe) => vibesCollectionRef.doc(vibe.id).set({ name: vibe.name }));
            data.ideas.forEach((idea: Idea) => {
                // When importing, we must separate the ID from the rest of the data
                const { id, ...ideaData } = idea;
                ideasCollectionRef.doc(id).set(ideaData);
            });
            
            await batch.commit();

            if (navigator.vibrate) navigator.vibrate([100, 30, 100]);
            alert('اطلاعات با موفقیت وارد شد!');
>>>>>>> 3a082df2ab9d4b583993143b228928c8b7d54ea1
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
        {ideas.length === 0 && !showArchived ? (
          <div className="flex flex-col items-center justify-center text-center py-20 animate-fade-in-up">
            <i className="ph-light ph-drop text-7xl text-purple-400 opacity-50 mb-6"></i>
            <h2 className="text-2xl font-bold text-white">ذهنت رو جاری کن...</h2>
            <p className="text-slate-400 mt-2 max-w-sm">اولین قطره را با دکمه درخشان پایین صفحه اضافه کن.</p>
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
          !showArchived && (
            <div className="flex flex-col items-center justify-center text-center py-20 animate-fade-in-up">
              <i className="ph-light ph-books text-7xl text-purple-400 opacity-50 mb-6"></i>
              <h2 className="text-2xl font-bold text-white">ایده فعالی نیست</h2>
              <p className="text-slate-400 mt-2 max-w-sm">برای دیدن ایده‌های بایگانی شده، دکمه آرشیو را در بالا بزنید.</p>
            </div>
          )
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