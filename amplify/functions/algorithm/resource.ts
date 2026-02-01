import { defineFunction, secret } from '@aws-amplify/backend';

export const algorithmFunction = defineFunction({
  name: 'algorithm',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: {
    // Use Amplify secret management for API keys
    // Set with: npx ampx secret set OPENAI_API_KEY
    OPENAI_API_KEY: secret('OPENAI_API_KEY'),
  },
});
