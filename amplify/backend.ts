import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { algorithmFunction } from './functions/algorithm/resource';
import { contentProcessor } from './functions/content-processor/resource';
import { emailHandler } from './functions/email-handler/resource';
import { youtubeExtractor } from './functions/youtube-extractor/resource';
import { storage } from './storage/resource';

/**
 * Anthist Backend
 * 
 * Components:
 * - auth: Cognito with email-only login
 * - data: DynamoDB via AppSync (User, Content, Engagement, Playlist, ContentRanking)
 * - storage: S3 for blog HTML and PDF storage
 * - functions:
 *   - contentProcessor: Extracts metadata and content from URLs
 *   - algorithmFunction: Ranks content based on engagement patterns
 *   - emailHandler: Processes incoming emails for content import
 *   - youtubeExtractor: Extracts videos from YouTube playlists
 * 
 * @see https://docs.amplify.aws/react/build-a-backend/
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  contentProcessor,
  algorithmFunction,
  emailHandler,
  youtubeExtractor,
});

// Get the S3 bucket reference
const storageBucket = backend.storage.resources.bucket;

// Grant content-processor Lambda access to S3
// Lambda writes to blogs/content/* path (not user-specific)
backend.contentProcessor.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['s3:PutObject', 's3:GetObject'],
    resources: [`${storageBucket.bucketArn}/blogs/content/*`],
  })
);

// Pass bucket name to content-processor as environment variable
// Access the underlying CfnFunction to add environment variables
const cfnFunction = backend.contentProcessor.resources.cfnResources.cfnFunction;
cfnFunction.addPropertyOverride('Environment.Variables.STORAGE_BUCKET_NAME', storageBucket.bucketName);
