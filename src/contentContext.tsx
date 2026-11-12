import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Game, Story, GAMES as DEFAULT_GAMES, STORIES as DEFAULT_STORIES } from './data';

const GAMES_KEY = 'gg-content-games';
const STORIES_KEY = 'gg-content-stories';

export interface ContentContextType {
  games: Game[];
  stories: Story[];
  addGame: (game: Omit<Game, 'id'> & { id?: string }) => Game;
  updateGame: (id: string, updates: Partial<Game>) => void;
  deleteGame: (id: string) => void;
  resetGames: () => void;
  addStory: (story: Omit<Story, 'id'> & { id?: string }) => Story;
  updateStory: (id: string, updates: Partial<Story>) => void;
  deleteStory: (id: string) => void;
  resetStories: () => void;
}

export const ContentContext = createContext<ContentContextType>({
  games: DEFAULT_GAMES,
  stories: DEFAULT_STORIES,
  addGame: () => DEFAULT_GAMES[0],
  updateGame: () => {},
  deleteGame: () => {},
  resetGames: () => {},
  addStory: () => DEFAULT_STORIES[0],
  updateStory: () => {},
  deleteStory: () => {},
  resetStories: () => {},
});

export const useContent = () => useContext(ContentContext);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [games, setGames] = useState<Game[]>(() => {
    try {
      const stored = localStorage.getItem(GAMES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_GAMES;
  });

  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const stored = localStorage.getItem(STORIES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_STORIES;
  });

  const saveGames = (next: Game[]) => {
    setGames(next);
    try {
      localStorage.setItem(GAMES_KEY, JSON.stringify(next));
    } catch {}
  };

  const saveStories = (next: Story[]) => {
    setStories(next);
    try {
      localStorage.setItem(STORIES_KEY, JSON.stringify(next));
    } catch {}
  };

  const addGame = useCallback((newGameData: Omit<Game, 'id'> & { id?: string }): Game => {
    const slug = (newGameData.name || 'game')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'custom-game';
    let id = newGameData.id || slug;
    // Ensure uniqueness
    if (games.some(g => g.id === id)) {
      id = `${id}-${Date.now().toString(36).slice(-4)}`;
    }
    const created: Game = {
      ...newGameData,
      id,
      colors: newGameData.colors || ['#2C261F', '#E5A93C'],
      equipment: newGameData.equipment || [],
      rules: newGameData.rules || [],
      glossary: newGameData.glossary || [],
    };
    const next = [created, ...games];
    saveGames(next);
    return created;
  }, [games]);

  const updateGame = useCallback((id: string, updates: Partial<Game>) => {
    const next = games.map(g => (g.id === id ? { ...g, ...updates } : g));
    saveGames(next);
  }, [games]);

  const deleteGame = useCallback((id: string) => {
    const next = games.filter(g => g.id !== id);
    saveGames(next);
  }, [games]);

  const resetGames = useCallback(() => {
    saveGames(DEFAULT_GAMES);
  }, []);

  const addStory = useCallback((newStoryData: Omit<Story, 'id'> & { id?: string }): Story => {
    const slug = (newStoryData.title || 'story')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'custom-story';
    let id = newStoryData.id || slug;
    if (stories.some(s => s.id === id)) {
      id = `${id}-${Date.now().toString(36).slice(-4)}`;
    }
    const created: Story = {
      ...newStoryData,
      id,
      colors: newStoryData.colors || ['#3a2410', '#8a5a1c'],
      body: newStoryData.body || [],
    };
    const next = [created, ...stories];
    saveStories(next);
    return created;
  }, [stories]);

  const updateStory = useCallback((id: string, updates: Partial<Story>) => {
    const next = stories.map(s => (s.id === id ? { ...s, ...updates } : s));
    saveStories(next);
  }, [stories]);

  const deleteStory = useCallback((id: string) => {
    const next = stories.filter(s => s.id !== id);
    saveStories(next);
  }, [stories]);

  const resetStories = useCallback(() => {
    saveStories(DEFAULT_STORIES);
  }, []);

  return (
    <ContentContext.Provider
      value={{
        games,
        stories,
        addGame,
        updateGame,
        deleteGame,
        resetGames,
        addStory,
        updateStory,
        deleteStory,
        resetStories,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}
