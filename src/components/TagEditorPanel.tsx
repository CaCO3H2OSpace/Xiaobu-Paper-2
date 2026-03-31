import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Sparkles, RefreshCw } from 'lucide-react';
import { Note, Notebook } from '../types';

interface TagEditorPanelProps {
  note: Note;
  onClose: () => void;
  onUpdateNote: (id: string, updates: Partial<Note>, skipTimestampUpdate?: boolean) => void;
  notes: Note[];
  notebooks: Notebook[];
}

export default function TagEditorPanel({ note, onClose, onUpdateNote, notes, notebooks }: TagEditorPanelProps) {
  const [newTag, setNewTag] = useState('');
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [isGeneratingAiTags, setIsGeneratingAiTags] = useState(false);

  const tags = note.tags || [];

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;

    let newTags = [...tags];
    if (!newTags.includes(trimmedTag)) {
      newTags.push(trimmedTag);
    }

    onUpdateNote(note.id, { tags: newTags }, true);
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateNote(note.id, { tags: tags.filter(t => t !== tagToRemove) }, true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(newTag);
    }
  };

  const generateAiTags = () => {
    setIsGeneratingAiTags(true);
    // Simulate AI generation delay
    setTimeout(() => {
      const possibleTags = ['重要', '待办', '灵感', '会议', '学习', '工作', '生活', '阅读', '项目', '总结'];
      // Randomly select 3 tags that are not already in the note
      const availableTags = possibleTags.filter(t => !tags.includes(t));
      const shuffled = availableTags.sort(() => 0.5 - Math.random());
      setAiTags(shuffled.slice(0, 3));
      setIsGeneratingAiTags(false);
    }, 600);
  };

  useEffect(() => {
    generateAiTags();
  }, [note.id]);

  // Calculate recent tags (from other notes)
  const recentTags: string[] = Array.from<string>(new Set(notes.flatMap(n => n.tags)))
    .filter(t => !tags.includes(t))
    .slice(0, 6);

  // List of all collected tags
  const collectedTagsList: string[] = [];

  const allExistingTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach(n => n.tags.forEach(t => set.add(t)));
    return Array.from(set);
  }, [notes, notebooks]);

  const matchedTags = useMemo(() => {
    const trimmed = newTag.trim().toLowerCase();
    if (!trimmed) return [];
    return allExistingTags
      .filter(t => t.toLowerCase().includes(trimmed) && !tags.includes(t));
  }, [newTag, allExistingTags, tags]);

  return (
    <div className="absolute inset-0 bg-black/40 flex items-end z-50 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full bg-white rounded-t-2xl h-[60vh] flex flex-col pb-[env(safe-area-inset-bottom)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-900">编辑标签</h3>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {/* Current Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[...tags].map(tag => {
              return (
              <span 
                key={tag} 
                className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm"
              >
                {tag}
                <button 
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1.5 text-indigo-400 hover:text-indigo-600"
                >
                  <X size={14} />
                </button>
              </span>
            )})}
            <div className="flex items-center px-3 py-1.5 bg-white rounded-full border border-gray-100 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="添加标签..."
                className="bg-transparent border-none focus:outline-none text-sm w-24 text-gray-700 placeholder-gray-400"
              />
              {newTag.trim() && (
                <button 
                  onClick={() => handleAddTag(newTag)}
                  className="ml-1 text-indigo-600"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
          </div>

          {newTag.trim() ? (
            /* Matched Tags */
            matchedTags.length > 0 && (
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-700 mb-3">我的标签</div>
                <div className="flex flex-wrap gap-2">
                  {matchedTags.map(tag => {
                    return (
                      <button
                        key={tag}
                        onClick={() => handleAddTag(tag)}
                        className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          ) : (
            <>
              {/* Recent Tags */}
              {recentTags.length > 0 && (
                <div className="mb-6">
                  <div className="text-sm font-medium text-gray-700 mb-3">最近使用</div>
                  <div className="flex flex-wrap gap-2">
                    {recentTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleAddTag(tag)}
                        className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Recommended Tags */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 flex items-center shrink-0">
                  <Sparkles size={16} className="text-amber-500 mr-1.5" />
                  推荐：
                </span>
                <div className="flex flex-wrap gap-2 flex-1">
                  {isGeneratingAiTags ? (
                    <div className="text-sm text-gray-400 py-1.5">生成中...</div>
                  ) : aiTags.length > 0 ? (
                    aiTags.map(tag => {
                      return (
                      <button
                        key={tag}
                        onClick={() => handleAddTag(tag)}
                        className="flex items-center px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm hover:bg-amber-100 transition-colors"
                      >
                        {tag}
                      </button>
                    )})
                  ) : (
                    <div className="text-sm text-gray-400 py-1.5">暂无推荐</div>
                  )}
                </div>
                <button 
                  onClick={generateAiTags}
                  disabled={isGeneratingAiTags}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors shrink-0 ml-auto"
                  title="换一批"
                >
                  <RefreshCw size={14} className={isGeneratingAiTags ? "animate-spin" : ""} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
