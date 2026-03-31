export interface Notebook {
  id: string;
  name: string;
  updatedAt: number;
  createdAt: number;
  coverColor?: string;
  coverImage?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  notebookId: string | null;
  updatedAt: number;
  createdAt: number;
  createDevice?: string;
  updateDevice?: string;
  audioDuration?: string;
  images?: string[];
  link?: {
    source: string;
    url: string;
  };
  isUnviewed?: boolean;
  isGenerating?: boolean;
  generatingProgress?: number;
  readLater?: boolean;
}

export interface Excerpt {
  id: string;
  noteId: string;
  text: string;
  source: string;
  date: string;
  highlightedWords: string[];
  highlightColor: string;
  originalSentence?: string; // To help locate the sentence in the note
}
