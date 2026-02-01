import { defineFunction } from '@aws-amplify/backend';

export const algorithmFunction = defineFunction({
  name: 'algorithm',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
});
