import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { contentProcessor } from '../functions/content-processor/resource';

/**
 * Feed App Data Schema
 * 
 * Models:
 * - User: Extended user profile with settings
 * - Content: Blog, YouTube video, PDF, or playlist item
 * - Engagement: Telemetry data for algorithm training
 * - Playlist: User-created content collections
 * 
 * Custom Mutations:
 * - processContent: Invoke Lambda to extract content from URL
 */
const schema = a.schema({
  // Custom type for content processing response
  ProcessedContentResponse: a.customType({
    title: a.string(),
    description: a.string(),
    author: a.string(),
    thumbnail: a.string(),
    publishedAt: a.string(),
    wordCount: a.integer(),
    readingTimeMinutes: a.integer(),
    semanticTags: a.string().array(),
    s3Key: a.string(),
    extractedHtml: a.string(),
  }),

  // Custom mutation to process content via Lambda
  processContent: a
    .mutation()
    .arguments({
      contentId: a.string().required(),
      url: a.string().required(),
      type: a.string().required(), // 'BLOG' | 'YOUTUBE' | 'PDF'
      userId: a.string().required(),
    })
    .returns(a.ref('ProcessedContentResponse'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(contentProcessor)),
  // User profile extending Cognito user
  User: a
    .model({
      cognitoId: a.string().required(),
      email: a.string().required(),
      importerEmail: a.string().required(), // randomly generated email for content import
      hasSeenTutorial: a.boolean().default(false),
      preferredTheme: a.string().default('auto'), // 'auto' = algorithm selects
      accessibilityMode: a.boolean().default(false), // high contrast mode
      defaultPlaylistId: a.string(),
      createdAt: a.datetime(),
    })
    .identifier(['cognitoId'])
    .authorization((allow) => [allow.owner()]),

  // Content items (blogs, videos, PDFs)
  Content: a
    .model({
      userId: a.string().required(),
      url: a.string().required(),
      type: a.enum(['BLOG', 'YOUTUBE', 'PDF', 'PLAYLIST_VIDEO']),
      title: a.string().required(),
      description: a.string(),
      thumbnail: a.string(),
      s3Key: a.string(), // for stored blog HTML or PDF
      // Embedding vector stored as JSON string (DynamoDB doesn't support float arrays)
      embeddingJson: a.string(),
      // Semantic tags for theme matching (e.g., 'tech', 'cooking', 'philosophy')
      semanticTags: a.string().array(),
      // For YouTube playlist items
      playlistId: a.string(),
      playlistIndex: a.integer(),
      // Content metadata
      duration: a.integer(), // seconds for video, estimated read time for blogs
      wordCount: a.integer(), // for blogs
      author: a.string(),
      publishedAt: a.datetime(),
      // User state
      status: a.enum(['ACTIVE', 'HIDDEN', 'DELETED']),
      // Consumption tracking
      lastViewedAt: a.datetime(),
      viewCount: a.integer().default(0),
      completionRate: a.float().default(0), // 0-1
      scrollPosition: a.float().default(0), // 0-1 for resume
      videoPosition: a.integer().default(0), // seconds for video resume
      createdAt: a.datetime(),
    })
    .secondaryIndexes((index) => [
      index('userId').sortKeys(['createdAt']).name('byUserCreatedAt'),
      index('userId').sortKeys(['status']).name('byUserStatus'),
    ])
    .authorization((allow) => [allow.owner()]),

  // Engagement telemetry for algorithm training
  Engagement: a
    .model({
      userId: a.string().required(),
      contentId: a.string().required(),
      sessionId: a.string().required(), // group events by viewing session
      // Time metrics
      timeSpent: a.integer().required(), // milliseconds
      timeOfDay: a.integer().required(), // hour 0-23
      dayOfWeek: a.integer().required(), // 0-6
      // Scroll behavior (for blogs)
      scrollDepth: a.float(), // 0-1 how far scrolled
      scrollSpeed: a.float(), // pixels per ms average
      scrollPauses: a.integer(), // number of pauses (reading indicator)
      // Video behavior
      videoPauses: a.integer(),
      videoSeeks: a.integer(),
      videoCompletionRate: a.float(),
      // Attention signals
      touchCount: a.integer(), // screen interactions
      gyroVariance: a.float(), // device movement variance
      focusLost: a.integer(), // times app went to background
      // Outcome
      swipeDirection: a.enum(['NEXT', 'BACK', 'NONE']), // how they left
      timestamp: a.datetime().required(),
    })
    .secondaryIndexes((index) => [
      index('userId').sortKeys(['timestamp']).name('byUserTimestamp'),
      index('contentId').sortKeys(['timestamp']).name('byContentTimestamp'),
    ])
    .authorization((allow) => [allow.owner()]),

  // User playlists for organizing content
  Playlist: a
    .model({
      userId: a.string().required(),
      name: a.string().required(),
      description: a.string(),
      isDefault: a.boolean().default(false),
      isShared: a.boolean().default(false), // for future friend sharing
      createdAt: a.datetime(),
    })
    .secondaryIndexes((index) => [
      index('userId').sortKeys(['createdAt']).name('byUserCreatedAt'),
    ])
    .authorization((allow) => [allow.owner()]),

  // Algorithm ranking cache (computed server-side)
  ContentRanking: a
    .model({
      userId: a.string().required(),
      playlistId: a.string().required().default('ALL'), // 'ALL' = all content, otherwise playlist ID
      // Ordered list of content IDs with scores
      rankingsJson: a.string().required(), // JSON: [{contentId, score, reason}]
      computedAt: a.datetime().required(),
      // Algorithm version for invalidation
      algorithmVersion: a.string().required(),
    })
    .identifier(['userId', 'playlistId'])
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
