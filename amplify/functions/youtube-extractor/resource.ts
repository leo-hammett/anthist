import { defineFunction } from '@aws-amplify/backend';

export const youtubeExtractor = defineFunction({
  name: 'youtube-extractor',
  entry: './handler.ts',
  timeoutSeconds: 120, // Playlist extraction can be slow
  memoryMB: 512,
});
