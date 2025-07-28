import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Idea, Vibe } from './types';
import Header from './components/Header';
import IdeaCard from './components/IdeaCard';
import FloatingActionButton from './components/FloatingActionButton';
import Modal from './components/Modal';
import IdeaForm from './components/IdeaForm';
import CategoryManager from './components/CategoryManager';
import ShareModal from './components/ShareModal';
import LoginScreen from './components/LoginScreen';
import { auth, db } from './firebaseConfig';

const DEFAULT_VIBES: Vibe[] = [
  { id: '1', name: '🚀 پروژه' },
  { id: '2', name: '🤔 فکر خام' },
  { id: '3', name: '💡 لامپ' },
];

// Extend the firebase.User type to include our custom displayName
type AppUser = firebase.User & { displayName: string | null };

const App: React.FC = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [vibes, setVibes] = useState<Vibe[]>(DEFAULT_VIBES);
  const [isIdeaModalOpen, setIdeaModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [ideaToShare, setIdeaToShare] = useState<Idea | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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
        if (!snapshot.empty) {
          const userVibes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Vibe[];
          setVibes(userVibes);
        } else {
           // If vibes are empty (might happen in rare cases), set defaults
           setVibes(DEFAULT_VIBES);
        }
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
    }
  }, [user]);

  const vibesMap = useMemo(() => new Map(vibes.map(vibe => [vibe.id, vibe])), [vibes]);
  const ideasMap = useMemo(() => new Map(ideas.map(idea => [idea.id, idea])), [ideas]);
  
  const ideasCollectionRef = user ? db.collection('users').doc(user.uid).collection('ideas') : null;
  const vibesCollectionRef = user ? db.collection('users').doc(user.uid).collection('vibes') : null;

  const addIdea = async (ideaData: Omit<Idea, 'id' | 'timestamp'>) => {
    if (!ideasCollectionRef) return;
    const newIdea: Idea = {
      ...ideaData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      isArchived: false,
      isPinned: false,
    };

    const batch = db.batch();
    batch.set(ideasCollectionRef.doc(newIdea.id), newIdea);

    // Create two-way links
    if (newIdea.linkedIdeaIds && newIdea.linkedIdeaIds.length > 0) {
      newIdea.linkedIdeaIds.forEach(linkedId => {
        const linkedIdea = ideas.find(i => i.id === linkedId);
        if (linkedIdea) {
          const newLinkedIds = Array.from(new Set([...(linkedIdea.linkedIdeaIds || []), newIdea.id]));
          batch.update(ideasCollectionRef.doc(linkedId), { linkedIdeaIds: newLinkedIds });
        }
      });
    }
    await batch.commit();
    if (navigator.vibrate) navigator.vibrate(50);
  };
  
  const archiveIdea = (id: string) => ideasCollectionRef?.doc(id).update({ isArchived: true, isPinned: false });
  const unarchiveIdea = (id: string) => ideasCollectionRef?.doc(id).update({ isArchived: false });
  const togglePinIdea = (id: string) => {
    const idea = ideas.find(i => i.id === id);
    if(idea) ideasCollectionRef?.doc(id).update({ isPinned: !idea.isPinned });
  };
  
  const deleteIdea = async (idToDelete: string) => {
    if (!ideasCollectionRef) return;
    const batch = db.batch();
    batch.delete(ideasCollectionRef.doc(idToDelete));

    // Remove links from other ideas
    ideas.forEach(idea => {
      if (idea.linkedIdeaIds?.includes(idToDelete)) {
        const updatedLinks = idea.linkedIdeaIds.filter(linkId => linkId !== idToDelete);
        batch.update(ideasCollectionRef.doc(idea.id), { linkedIdeaIds: updatedLinks });
      }
    });

    await batch.commit();
    if (navigator.vibrate) navigator.vibrate(100);
  };

  const addVibe = (name: string) => {
    if (!vibesCollectionRef) return;
    const newVibe: Vibe = { id: crypto.randomUUID(), name };
    vibesCollectionRef.doc(newVibe.id).set({ name });
  };
  
  const deleteVibe = (id: string) => {
    if (DEFAULT_VIBES.some(v => v.id === id)) return;
    if (ideas.some(idea => idea.vibeId === id)) {
      alert('نمی‌توانید وایبی که برای یک ایده استفاده شده را حذف کنید.');
      return;
    }
    vibesCollectionRef?.doc(id).delete();
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
    if (!file || !ideasCollectionRef || !vibesCollectionRef) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error('File content is not text.');
        const data = JSON.parse(text);

        if (!data || !Array.isArray(data.ideas) || !Array.isArray(data.vibes)) {
          throw new Error('Invalid JSON structure.');
        }

        const isConfirmed = window.confirm(
          'آیا مطمئن هستید؟ با این کار تمام اطلاعات فعلی شما در فضای ابری بازنویسی خواهد شد.'
        );
        
        if (isConfirmed) {
            const batch = db.batch();
            // Delete old data
            (await ideasCollectionRef.get()).docs.forEach(doc => batch.delete(doc.ref));
            (await vibesCollectionRef.get()).docs.forEach(doc => batch.delete(doc.ref));
            // Add new data
            data.vibes.forEach((vibe: Vibe) => batch.set(vibesCollectionRef.doc(vibe.id), { name: vibe.name }));
            data.ideas.forEach((idea: Idea) => batch.set(ideasCollectionRef.doc(idea.id), idea));
            
            await batch.commit();

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
  
  const handleLogout = () => auth.signOut();

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

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
         <i className="ph-bold ph-circle-notch text-4xl text-purple-400 animate-spin"></i>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

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
        userName={user.displayName}
        onManageVibes={() => setCategoryModalOpen(true)}
        onToggleArchived={() => setShowArchived(prev => !prev)}
        isArchivedVisible={showArchived}
        onExport={handleExportData}
        onImport={handleImportClick}
        onLogout={handleLogout}
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

        <footer className="text-center text-slate-500 text-sm mt-12">
            ساخته شده توسط A.M code
        </footer>
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
