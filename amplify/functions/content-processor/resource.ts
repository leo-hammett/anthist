import { defineFunction, secret } from '@aws-amplify/backend';

export const contentProcessor = defineFunction({
  name: 'content-processor',
  entry: './handler.ts',
  timeoutSeconds: 60,
  memoryMB: 512,
  environment: {
    // Use Amplify secret management for API keys
    // Set with: npx ampx secret set OPENAI_API_KEY
    OPENAI_API_KEY: secret('OPENAI_API_KEY'),
  },
});
