import { defineFunction } from '@aws-amplify/backend';

export const contentProcessor = defineFunction({
  name: 'content-processor',
  entry: './handler.ts',
  timeoutSeconds: 60,
  memoryMB: 512,
});
