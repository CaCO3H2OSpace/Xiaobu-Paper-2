import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Remove autoCollectTag from initial state
content = content.replace(/autoCollectTag: '[^']+', /g, '');

// Remove related state
content = content.replace(/const \[modalAutoCollectTag, setModalAutoCollectTag\] = useState<string>\(''\);\n/g, '');
content = content.replace(/const \[isAutoCollectTagFocused, setIsAutoCollectTagFocused\] = useState\(false\);\n/g, '');
content = content.replace(/const \[pendingSaveNotebookData, setPendingSaveNotebookData\] = useState<\{name: string, autoCollectTag: string \| null\} \| null>\(null\);\n/g, '');

// Remove autoCollectTags useMemo
content = content.replace(/const autoCollectTags = useMemo\(\(\) => \{\n    return new Set\(notebooks\.map\(nb => nb\.autoCollectTag\)\.filter\(Boolean\) as string\[\]\);\n  \}, \[notebooks\]\);\n/g, '');

// Update recentTagsForNotebook
content = content.replace(/const recentTagsForNotebook = useMemo\(\(\) => \{\n    return Array\.from\(new Set\(notes\.flatMap\(n => n\.tags\)\)\)\n      \.filter\(t => !autoCollectTags\.has\(t\)\)\n      \.slice\(0, 6\);\n  \}, \[notes, autoCollectTags\]\);/g, `const recentTagsForNotebook = useMemo(() => {
    return Array.from(new Set(notes.flatMap(n => n.tags)))
      .slice(0, 6);
  }, [notes]);`);

// Remove suggestedTags
content = content.replace(/const suggestedTags = useMemo\(\(\) => \{[\s\S]*?\}, \[modalAutoCollectTag, notes, notebooks\]\);\n/g, '');

// Update sortTags
content = content.replace(/const sortTags = \(tags: string\[\]\) => \{[\s\S]*?return 0;\n    \}\);\n  \};\n/g, `const sortTags = (tags: string[]) => {
    return [...tags].sort((a, b) => a.localeCompare(b));
  };
`);

// Update openNotebookModal
content = content.replace(/setModalAutoCollectTag\(notebook\?\.autoCollectTag \|\| ''\);\n/g, '');

// Update handleSaveNotebook
content = content.replace(/const handleSaveNotebook = \(e: React\.FormEvent<HTMLFormElement>\) => \{[\s\S]*?saveNotebook\(name, autoCollectTag\);\n  \};\n/g, `const handleSaveNotebook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    saveNotebook(name);
  };
`);

// Update saveNotebook
content = content.replace(/const saveNotebook = \(name: string, autoCollectTag: string \| null, resolveConflict: boolean = false\) => \{[\s\S]*?setPendingSaveNotebookData\(null\);\n  \};\n/g, `const saveNotebook = (name: string) => {
    setNotebooks(prevNotebooks => {
      if (editingNotebook) {
        return prevNotebooks.map(nb => nb.id === editingNotebook.id ? {
          ...nb, 
          name, 
          coverColor: modalCoverColor,
          coverImage: modalCoverImage || undefined,
          updatedAt: Date.now()
        } : nb);
      } else {
        return [...prevNotebooks, {
          id: crypto.randomUUID(),
          name,
          coverColor: modalCoverColor,
          coverImage: modalCoverImage || undefined,
          updatedAt: Date.now(),
          createdAt: Date.now()
        }];
      }
    });

    setIsNotebookModalOpen(false);
    setEditingNotebook(null);
  };
`);

// Remove confirmSaveNotebookWithConflict
content = content.replace(/const confirmSaveNotebookWithConflict = \(\) => \{[\s\S]*?\}\n/g, '');

// Update NoteCard tags
content = content.replace(/const isAutoCollect = autoCollectTags\.has\(tag\);\n              return \(\n                <span key=\{tag\} className="text-blue-600 text-\[12px\] font-medium flex items-center gap-1 bg-blue-50 px-2 py-0\.5 rounded-md">\n                  \{isAutoCollect && <Inbox size=\{10\} className="text-blue-600" \/>\}\n                  \{tag\}\n                <\/span>\n              \);\n/g, `return (
                <span key={tag} className="text-blue-600 text-[12px] font-medium flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md">
                  {tag}
                </span>
              );
`);

// Update NotebookCard count
content = content.replace(/const count = notes\.filter\(n => n\.notebookId === notebook\.id \|\| \(notebook\.autoCollectTag && n\.tags\.includes\(notebook\.autoCollectTag\)\)\)\.length;/g, `const count = notes.filter(n => n.notebookId === notebook.id).length;`);

// Update NotebookCard autoCollectTag display
content = content.replace(/\{notebook\.autoCollectTag \? \(\n                <span className="bg-black\/30 backdrop-blur-md text-white px-2 py-1 rounded-lg text-\[10px\] font-medium flex items-center gap-1 shadow-sm">\n                  <Inbox size=\{10\} \/>\n                  \{notebook\.autoCollectTag\}\n                <\/span>\n              \) : <div><\/div>\}/g, `<div></div>`);

// Update renderNotebookDetail notebookNotes
content = content.replace(/const notebookNotes = notes\.filter\(n => n\.notebookId === activeNotebook\.id \|\| \(activeNotebook\.autoCollectTag && n\.tags\.includes\(activeNotebook\.autoCollectTag\)\)\);/g, `const notebookNotes = notes.filter(n => n.notebookId === activeNotebook.id);`);

// Update renderNotebookDetail autoCollectTag display
content = content.replace(/\{activeNotebook\.autoCollectTag && \(\n                  <span className="bg-white\/80 backdrop-blur-md text-gray-700 px-2\.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm">\n                    <Inbox size=\{12\} \/>\n                    自动收纳: \{activeNotebook\.autoCollectTag\}\n                  <\/span>\n                \)\}/g, ``);

// Update renderEditor tags
content = content.replace(/const isAutoCollect = autoCollectTags\.has\(tag\);\n              return \(\n                <span key=\{tag\} className="inline-flex items-center gap-1 px-2\.5 py-1 rounded-md text-\[13px\] font-medium bg-blue-50 text-blue-600">\n                  \{isAutoCollect && <Inbox size=\{12\} \/>\}\n                  \{tag\}\n                <\/span>\n              \);\n/g, `return (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[13px] font-medium bg-blue-50 text-blue-600">
                  {tag}
                </span>
              );
`);

// Remove autoCollectTag input from NotebookModal
content = content.replace(/<div className="mb-6 relative">[\s\S]*?<\/div>\n\n                <div className="flex gap-3">/g, `<div className="flex gap-3">`);

// Update NoteOptionsOpen belongingNotebooks
content = content.replace(/const belongingNotebooks = notebooks\.filter\(nb => \n            currentNote\.notebookId === nb\.id \|\| \n            \(nb\.autoCollectTag && currentNote\.tags\.includes\(nb\.autoCollectTag\)\)\n          \);/g, `const belongingNotebooks = notebooks.filter(nb => currentNote.notebookId === nb.id);`);

// Update RemoveConfirmModal belongingNotebooks
content = content.replace(/const belongingNotebooks = notebooks\.filter\(nb => \n                        currentNote\.notebookId === nb\.id \|\| \n                        \(nb\.autoCollectTag && currentNote\.tags\.includes\(nb\.autoCollectTag\)\)\n                      \);\n                      const tagsToRemove = new Set\(belongingNotebooks\.map\(nb => nb\.autoCollectTag\)\.filter\(Boolean\) as string\[\]\);\n                      const newTags = currentNote\.tags\.filter\(t => !tagsToRemove\.has\(t\)\);\n                      handleUpdateNote\(currentNote\.id, \{ notebookId: null, tags: newTags \}\);/g, `handleUpdateNote(currentNote.id, { notebookId: null });`);

// Remove pendingSaveNotebookData modal
content = content.replace(/\{pendingSaveNotebookData && \([\s\S]*?<\/div>\n        \)\}/g, '');

fs.writeFileSync('src/App.tsx', content);
