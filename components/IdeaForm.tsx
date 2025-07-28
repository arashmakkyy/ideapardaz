import React, { useState } from 'react';
import type { Idea, Vibe } from '../types';

interface IdeaFormProps {
  onSave: (idea: Omit<Idea, 'id' | 'timestamp'>) => Promise<void>;
  vibes: Vibe[];
  allIdeas: Idea[];
  onClose: () => void;
}

const IdeaForm: React.FC<IdeaFormProps> = ({ onSave, vibes, allIdeas, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [vibeId, setVibeId] = useState<string>(vibes[0]?.id || '');
  const [linkedIds, setLinkedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !vibeId || isSaving) return;

    setIsSaving(true);
    try {
      await onSave({ title, content, vibeId, linkedIdeaIds: linkedIds });
      onClose(); // Close modal ONLY on successful save
    } catch (error) {
      console.error("Failed to save idea:", error);
      alert("خطا در ذخیره ایده. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleVibeSelect = (id: string) => {
    setVibeId(id);
    if (navigator.vibrate) {
        navigator.vibrate(20);
    }
  }

  const toggleLinkedId = (id: string) => {
    setLinkedIds(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    if (navigator.vibrate) {
        navigator.vibrate(20);
    }
  };

  const inputStyle = "w-full p-3 bg-slate-900/50 border border-white/10 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-slate-100 disabled:opacity-50";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <input
        type="text"
        placeholder="عنوان ایده..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={inputStyle}
        disabled={isSaving}
        required
      />
      <textarea
        placeholder="ایده خود را اینجا بنویسید..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        className={inputStyle}
        disabled={isSaving}
        required
      />
      <div>
        <label className="text-slate-300 font-medium mb-2 block">یک وایب انتخاب کن:</label>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {vibes.map(vibe => (
            <button
              key={vibe.id}
              type="button"
              onClick={() => handleVibeSelect(vibe.id)}
              className={`px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all whitespace-nowrap disabled:opacity-50 ${
                vibeId === vibe.id
                  ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'
              }`}
              disabled={isSaving}
            >
              {vibe.name}
            </button>
          ))}
        </div>
      </div>

      {allIdeas.length > 0 && (
         <div>
            <label className="text-slate-300 font-medium">لینک به ایده‌های دیگر (اختیاری):</label>
            <div className="max-h-32 overflow-y-auto mt-2 space-y-2 pr-1 -mr-1">
                {allIdeas.map(idea => (
                    <button
                        key={idea.id}
                        type="button"
                        onClick={() => toggleLinkedId(idea.id)}
                        className={`w-full text-right p-3 rounded-lg transition-colors flex items-center justify-between disabled:opacity-50 ${
                            linkedIds.includes(idea.id) ? 'bg-purple-500/30 text-purple-200' : 'bg-slate-900/50 hover:bg-slate-800/60'
                        }`}
                        disabled={isSaving}
                    >
                        <span>{idea.title}</span>
                        {linkedIds.includes(idea.id) && <i className="ph-bold ph-check-circle text-purple-400"></i>}
                    </button>
                ))}
            </div>
        </div>
      )}

      <div className="flex justify-end gap-3 mt-4">
        <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-2.5 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors disabled:opacity-50">لغو</button>
        <button type="submit" disabled={isSaving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center min-w-[100px]">
            {isSaving ? <i className="ph-bold ph-circle-notch animate-spin text-xl"></i> : 'ذخیره'}
        </button>
      </div>
    </form>
  );
};

export default IdeaForm;
