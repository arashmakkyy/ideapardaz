
export interface Vibe {
  id: string;
  name: string;
}

export interface Idea {
  id: string;
  title: string;
  content: string;
  vibeId: string;
  timestamp: number;
  linkedIdeaIds?: string[];
  isArchived?: boolean;
  isPinned?: boolean;
}