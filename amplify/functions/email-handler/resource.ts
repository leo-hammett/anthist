import { defineFunction } from '@aws-amplify/backend';

export const emailHandler = defineFunction({
  name: 'email-handler',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
});
