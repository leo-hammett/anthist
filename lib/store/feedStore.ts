import { create } from 'zustand';
import { amplifyClient } from '../amplify-client';

export type ContentType = 'BLOG' | 'YOUTUBE' | 'PDF' | 'PLAYLIST_VIDEO';
export type ContentStatus = 'ACTIVE' | 'HIDDEN' | 'DELETED';

export interface Content {
  id: string;
  userId: string;
  url: string;
  type: ContentType;
  title: string;
  description?: string;
  thumbnail?: string;
  s3Key?: string;
  semanticTags?: string[];
  playlistId?: string;
  playlistIndex?: number;
  duration?: number;
  wordCount?: number;
  author?: string;
  publishedAt?: string;
  status: ContentStatus;
  lastViewedAt?: string;
  viewCount: number;
  completionRate: number;
  scrollPosition: number;
  videoPosition: number;
  createdAt: string;
}

interface ContentRanking {
  contentId: string;
  score: number;
  reason?: string;
}

// Response from processContent mutation
export interface ProcessedContentResult {
  title: string | null;
  description: string | null;
  author: string | null;
  thumbnail: string | null;
  publishedAt: string | null;
  wordCount: number | null;
  readingTimeMinutes: number | null;
  semanticTags: (string | null)[] | null;
  s3Key: string | null;
  extractedHtml: string | null;
}

interface ProcessContentInput {
  contentId: string;
  url: string;
  type: 'BLOG' | 'YOUTUBE' | 'PDF';
  userId: string;
}

interface FeedState {
  // Content
  contents: Content[];
  rankedContentIds: string[];
  currentIndex: number;
  isLoading: boolean;
  isReprocessing: string | null; // contentId being reprocessed
  error: string | null;

  // Navigation history (for back swipe)
  viewHistory: string[];
  
  // Theme preferences (contentId -> themeId)
  themeOverrides: Record<string, string>;

  // Actions
  fetchContents: (userId: string) => Promise<void>;
  fetchRankings: (userId: string) => Promise<void>;
  addContent: (content: Omit<Content, 'id' | 'createdAt' | 'viewCount' | 'completionRate' | 'scrollPosition' | 'videoPosition'>) => Promise<Content | null>;
  processContent: (input: ProcessContentInput) => Promise<ProcessedContentResult | null>;
  reprocessContent: (contentId: string, userId: string) => Promise<boolean>;
  updateContent: (id: string, updates: Partial<Content>) => Promise<void>;
  hideContent: (id: string) => Promise<void>;
  unhideContent: (id: string) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  
  // Navigation
  goToNext: () => void;
  goToPrevious: () => void;
  goToIndex: (index: number) => void;
  goToContentById: (id: string) => boolean;
  
  // Current content helpers
  getCurrentContent: () => Content | null;
  getContentById: (id: string) => Content | null;
  
  // Theme
  setThemeOverride: (contentId: string, themeId: string | null) => void;
  getThemeOverride: (contentId: string) => string | null;
  
  // Clear
  clearError: () => void;
  reset: () => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  contents: [],
  rankedContentIds: [],
  currentIndex: 0,
  isLoading: false,
  isReprocessing: null,
  error: null,
  viewHistory: [],
  themeOverrides: {},

  fetchContents: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data: contents, errors } = await amplifyClient.models.Content.list({
        filter: {
          userId: { eq: userId },
          status: { eq: 'ACTIVE' },
        },
      });

      if (errors) {
        throw new Error(errors[0].message);
      }

      const mappedContents: Content[] = (contents ?? []).map((c: any) => ({
        id: c.id,
        userId: c.userId,
        url: c.url,
        type: c.type as ContentType,
        title: c.title,
        description: c.description ?? undefined,
        thumbnail: c.thumbnail ?? undefined,
        s3Key: c.s3Key ?? undefined,
        semanticTags: c.semanticTags?.filter((t: any): t is string => t !== null) ?? [],
        playlistId: c.playlistId ?? undefined,
        playlistIndex: c.playlistIndex ?? undefined,
        duration: c.duration ?? undefined,
        wordCount: c.wordCount ?? undefined,
        author: c.author ?? undefined,
        publishedAt: c.publishedAt ?? undefined,
        status: c.status as ContentStatus,
        lastViewedAt: c.lastViewedAt ?? undefined,
        viewCount: c.viewCount ?? 0,
        completionRate: c.completionRate ?? 0,
        scrollPosition: c.scrollPosition ?? 0,
        videoPosition: c.videoPosition ?? 0,
        createdAt: c.createdAt ?? new Date().toISOString(),
      }));

      // Sort by createdAt descending (newest first) for initial load
      mappedContents.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Reset currentIndex to 0 to show newest content, but only if content exists
      // This ensures after adding content, the user sees their new item first
      set({ 
        contents: mappedContents,
        rankedContentIds: mappedContents.map(c => c.id),
        currentIndex: 0,
        isLoading: false,
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch contents',
        isLoading: false,
      });
    }
  },

  fetchRankings: async (userId: string) => {
    try {
      // Try to get cached rankings
      const { data: ranking } = await amplifyClient.models.ContentRanking.get({
        userId,
        playlistId: '', // Default playlist
      });

      if (ranking?.rankingsJson) {
        const rankings: ContentRanking[] = JSON.parse(ranking.rankingsJson);
        set({ rankedContentIds: rankings.map(r => r.contentId) });
      }
    } catch (error) {
      // Rankings not available, use default order
      console.log('Using default content order');
    }
  },

  addContent: async (contentData) => {
    try {
      set({ isLoading: true, error: null });

      const { data: newContent, errors } = await amplifyClient.models.Content.create({
        ...contentData,
        viewCount: 0,
        completionRate: 0,
        scrollPosition: 0,
        videoPosition: 0,
        createdAt: new Date().toISOString(),
      });

      if (errors) {
        throw new Error(errors[0].message);
      }

      if (newContent) {
        const mapped: Content = {
          id: newContent.id,
          userId: newContent.userId,
          url: newContent.url,
          type: newContent.type as ContentType,
          title: newContent.title,
          description: newContent.description ?? undefined,
          thumbnail: newContent.thumbnail ?? undefined,
          s3Key: newContent.s3Key ?? undefined,
          semanticTags: newContent.semanticTags?.filter((t): t is string => t !== null) ?? [],
          playlistId: newContent.playlistId ?? undefined,
          playlistIndex: newContent.playlistIndex ?? undefined,
          duration: newContent.duration ?? undefined,
          wordCount: newContent.wordCount ?? undefined,
          author: newContent.author ?? undefined,
          publishedAt: newContent.publishedAt ?? undefined,
          status: newContent.status as ContentStatus,
          lastViewedAt: newContent.lastViewedAt ?? undefined,
          viewCount: 0,
          completionRate: 0,
          scrollPosition: 0,
          videoPosition: 0,
          createdAt: newContent.createdAt ?? new Date().toISOString(),
        };

        set((state) => ({
          contents: [mapped, ...state.contents],
          rankedContentIds: [mapped.id, ...state.rankedContentIds],
          currentIndex: 0, // Reset to show the newly added content first
          isLoading: false,
        }));

        return mapped;
      }

      set({ isLoading: false });
      return null;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add content',
        isLoading: false,
      });
      return null;
    }
  },

  processContent: async (input: ProcessContentInput) => {
    try {
      console.log('Processing content:', input);
      
      // Call the processContent mutation which invokes the Lambda
      const { data, errors } = await amplifyClient.mutations.processContent({
        contentId: input.contentId,
        url: input.url,
        type: input.type,
        userId: input.userId,
      });

      if (errors) {
        console.error('Process content errors:', errors);
        throw new Error(errors[0].message);
      }

      if (!data) {
        throw new Error('No data returned from processing');
      }

      console.log('Content processed successfully:', data);
      return data as ProcessedContentResult;
    } catch (error) {
      console.error('Failed to process content:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to process content' });
      return null;
    }
  },

  reprocessContent: async (contentId: string, userId: string) => {
    const content = get().getContentById(contentId);
    if (!content) {
      set({ error: 'Content not found' });
      return false;
    }

    try {
      set({ isReprocessing: contentId, error: null });
      console.log('Reprocessing content:', contentId);

      // Call the processContent mutation
      const { data, errors } = await amplifyClient.mutations.processContent({
        contentId: content.id,
        url: content.url,
        type: content.type,
        userId: userId,
      });

      if (errors) {
        console.error('Reprocess content errors:', errors);
        throw new Error(errors[0].message);
      }

      if (!data) {
        throw new Error('No data returned from processing');
      }

      const result = data as ProcessedContentResult;

      // Update the content with the new data
      await get().updateContent(contentId, {
        title: result.title ?? content.url,
        description: result.description ?? undefined,
        author: result.author ?? undefined,
        thumbnail: result.thumbnail ?? undefined,
        wordCount: result.wordCount ?? undefined,
        semanticTags: result.semanticTags?.filter((t): t is string => t !== null) ?? [],
        s3Key: result.s3Key ?? undefined,
      });

      console.log('Content reprocessed successfully');
      set({ isReprocessing: null });
      return true;
    } catch (error) {
      console.error('Failed to reprocess content:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to reprocess content',
        isReprocessing: null,
      });
      return false;
    }
  },

  updateContent: async (id: string, updates: Partial<Content>) => {
    try {
      const { errors } = await amplifyClient.models.Content.update({
        id,
        ...updates,
      });

      if (errors) {
        throw new Error(errors[0].message);
      }

      set((state) => ({
        contents: state.contents.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update content' });
    }
  },

  hideContent: async (id: string) => {
    await get().updateContent(id, { status: 'HIDDEN' });
    // Remove from ranked list
    set((state) => ({
      rankedContentIds: state.rankedContentIds.filter((cId) => cId !== id),
    }));
  },

  unhideContent: async (id: string) => {
    await get().updateContent(id, { status: 'ACTIVE' });
    // Add back to ranked list
    set((state) => ({
      rankedContentIds: [...state.rankedContentIds, id],
    }));
  },

  deleteContent: async (id: string) => {
    try {
      const { errors } = await amplifyClient.models.Content.delete({ id });

      if (errors) {
        throw new Error(errors[0].message);
      }

      set((state) => ({
        contents: state.contents.filter((c) => c.id !== id),
        rankedContentIds: state.rankedContentIds.filter((cId) => cId !== id),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete content' });
    }
  },

  goToNext: () => {
    const { currentIndex, rankedContentIds, getCurrentContent } = get();
    const current = getCurrentContent();
    
    if (currentIndex < rankedContentIds.length - 1) {
      set((state) => ({
        currentIndex: state.currentIndex + 1,
        viewHistory: current ? [...state.viewHistory, current.id] : state.viewHistory,
      }));
    }
  },

  goToPrevious: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set((state) => ({
        currentIndex: state.currentIndex - 1,
      }));
    }
  },

  goToIndex: (index: number) => {
    const { rankedContentIds } = get();
    if (index >= 0 && index < rankedContentIds.length) {
      set({ currentIndex: index });
    }
  },

  goToContentById: (id: string) => {
    const { rankedContentIds } = get();
    const index = rankedContentIds.indexOf(id);
    if (index !== -1) {
      set({ currentIndex: index });
      return true;
    }
    return false;
  },

  getCurrentContent: () => {
    const { contents, rankedContentIds, currentIndex } = get();
    const contentId = rankedContentIds[currentIndex];
    return contents.find((c) => c.id === contentId) ?? null;
  },

  getContentById: (id: string) => {
    return get().contents.find((c) => c.id === id) ?? null;
  },

  setThemeOverride: (contentId: string, themeId: string | null) => {
    set((state) => {
      const newOverrides = { ...state.themeOverrides };
      if (themeId === null) {
        delete newOverrides[contentId];
      } else {
        newOverrides[contentId] = themeId;
      }
      return { themeOverrides: newOverrides };
    });
  },

  getThemeOverride: (contentId: string) => {
    return get().themeOverrides[contentId] ?? null;
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    contents: [],
    rankedContentIds: [],
    currentIndex: 0,
    isLoading: false,
    isReprocessing: null,
    error: null,
    viewHistory: [],
    themeOverrides: {},
  }),
}));
