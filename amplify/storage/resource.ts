import { defineStorage } from '@aws-amplify/backend';

/**
 * Feed App Storage Configuration
 * 
 * Stores:
 * - Blog content (extracted HTML from Readability) - written by Lambda via IAM
 * - PDF uploads - uploaded by users directly
 * - User thumbnails (if we generate custom ones)
 * 
 * Note: Lambda writes to blogs/content/* via IAM role (not user identity)
 * so we need authenticated read access for all users on that path.
 */
export const storage = defineStorage({
  name: 'feedContentBucket',
  access: (allow) => ({
    // Blog content - Lambda writes via IAM, any authenticated user can read
    // Content is keyed by contentId (unique), not userId
    'blogs/content/*': [
      allow.authenticated.to(['read']),
    ],
    // PDF uploads - each user can only access their own
    'pdfs/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    // Thumbnails - publicly readable for sharing, owner can write
    'thumbnails/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.guest.to(['read']),
    ],
  }),
});
