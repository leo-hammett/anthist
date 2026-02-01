import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

/**
 * Shared Amplify Data client instance.
 * Use this instead of calling generateClient() in multiple places.
 */
export const amplifyClient = generateClient<Schema>();
