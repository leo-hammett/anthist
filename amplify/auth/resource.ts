import { defineAuth } from '@aws-amplify/backend';

/**
 * Feed App Authentication Configuration
 * Email-only login for simplicity (grug brain: one way to login = less confusion)
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    // Store the randomly generated importer email address
    'custom:importerEmail': {
      dataType: 'String',
      mutable: true,
    },
    // Track if user has seen the onboarding tutorial
    'custom:hasSeenTutorial': {
      dataType: 'String',
      mutable: true,
    },
    // User's preferred theme (or 'auto' for algorithm selection)
    'custom:preferredTheme': {
      dataType: 'String',
      mutable: true,
    },
  },
});
