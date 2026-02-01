import type { Handler } from 'aws-lambda';

interface ContentItem {
  id: string;
  type: string;
  title: string;
  createdAt: string;
  lastViewedAt?: string;
  viewCount: number;
  completionRate: number;
  semanticTags: string[];
  embeddingJson?: string;
}

interface EngagementData {
  contentId: string;
  timeSpent: number;
  scrollDepth: number;
  scrollSpeed: number;
  completionRate: number;
  timeOfDay: number;
  dayOfWeek: number;
}

interface RankingRequest {
  userId: string;
  contents: ContentItem[];
  recentEngagements: EngagementData[];
  currentHour: number;
  currentDay: number;
}

interface RankedContent {
  contentId: string;
  score: number;
  reason: string;
}

/**
 * Content Ranking Algorithm
 * 
 * Ranks content based on:
 * 1. Time-of-day patterns (when user engages most)
 * 2. Content type preferences
 * 3. Scroll behavior patterns (fast scroll = less interest)
 * 4. Completion rates by content type
 * 5. Recency (newer content slight boost)
 * 6. Consumption state (resume vs fresh)
 * 7. Network effects (crowd signals - future)
 */
export const handler: Handler<RankingRequest, RankedContent[]> = async (event) => {
  console.log('Ranking content for user:', event.userId);

  const { contents, recentEngagements, currentHour, currentDay } = event;

  // Build engagement profile from recent history
  const engagementProfile = buildEngagementProfile(recentEngagements);

  // Score each content item
  const rankings: RankedContent[] = contents.map(content => {
    const score = calculateContentScore(content, engagementProfile, currentHour, currentDay);
    const reason = generateReason(content, engagementProfile);
    
    return {
      contentId: content.id,
      score,
      reason,
    };
  });

  // Sort by score descending
  rankings.sort((a, b) => b.score - a.score);

  return rankings;
};

interface EngagementProfile {
  // Time preferences
  preferredHours: Map<number, number>; // hour -> engagement score
  preferredDays: Map<number, number>; // day -> engagement score
  
  // Content type preferences
  typePreferences: Map<string, number>; // type -> preference score
  
  // Behavior patterns
  avgScrollSpeed: number;
  avgTimeSpent: number;
  avgCompletionRate: number;
  
  // Tag preferences
  tagPreferences: Map<string, number>; // tag -> preference score
}

function buildEngagementProfile(engagements: EngagementData[]): EngagementProfile {
  const profile: EngagementProfile = {
    preferredHours: new Map(),
    preferredDays: new Map(),
    typePreferences: new Map(),
    avgScrollSpeed: 0,
    avgTimeSpent: 0,
    avgCompletionRate: 0,
    tagPreferences: new Map(),
  };

  if (engagements.length === 0) {
    return profile;
  }

  // Aggregate engagement data
  let totalScrollSpeed = 0;
  let totalTimeSpent = 0;
  let totalCompletionRate = 0;

  for (const engagement of engagements) {
    // Time patterns - weight by engagement quality
    const qualityScore = calculateEngagementQuality(engagement);
    
    const hourScore = profile.preferredHours.get(engagement.timeOfDay) ?? 0;
    profile.preferredHours.set(engagement.timeOfDay, hourScore + qualityScore);
    
    const dayScore = profile.preferredDays.get(engagement.dayOfWeek) ?? 0;
    profile.preferredDays.set(engagement.dayOfWeek, dayScore + qualityScore);

    // Behavior aggregates
    totalScrollSpeed += engagement.scrollSpeed;
    totalTimeSpent += engagement.timeSpent;
    totalCompletionRate += engagement.completionRate;
  }

  // Calculate averages
  profile.avgScrollSpeed = totalScrollSpeed / engagements.length;
  profile.avgTimeSpent = totalTimeSpent / engagements.length;
  profile.avgCompletionRate = totalCompletionRate / engagements.length;

  return profile;
}

function calculateEngagementQuality(engagement: EngagementData): number {
  // Quality score based on multiple signals
  let score = 0;

  // Time spent (normalized to 0-1, cap at 10 minutes)
  score += Math.min(engagement.timeSpent / (10 * 60 * 1000), 1) * 0.3;

  // Scroll depth
  score += engagement.scrollDepth * 0.2;

  // Completion rate
  score += engagement.completionRate * 0.3;

  // Slow scroll speed indicates reading (inverse relationship)
  // Normalize scroll speed - slower is better
  const scrollScore = engagement.scrollSpeed > 0 
    ? Math.max(0, 1 - engagement.scrollSpeed / 2) 
    : 0.5;
  score += scrollScore * 0.2;

  return score;
}

function calculateContentScore(
  content: ContentItem,
  profile: EngagementProfile,
  currentHour: number,
  currentDay: number
): number {
  let score = 0;
  const weights = {
    recency: 0.15,
    timeMatch: 0.20,
    completion: 0.25,
    freshness: 0.20,
    typePreference: 0.20,
  };

  // 1. Recency boost - newer content gets a boost
  const ageInDays = (Date.now() - new Date(content.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, 1 - ageInDays / 30); // Decay over 30 days
  score += recencyScore * weights.recency;

  // 2. Time-of-day match
  const hourPreference = profile.preferredHours.get(currentHour) ?? 0;
  const maxHourPref = Math.max(...Array.from(profile.preferredHours.values()), 1);
  const timeScore = hourPreference / maxHourPref;
  score += timeScore * weights.timeMatch;

  // 3. Completion state - prioritize unfinished content
  if (content.completionRate > 0 && content.completionRate < 0.9) {
    // Partially consumed - good for resuming
    score += 0.8 * weights.completion;
  } else if (content.completionRate === 0) {
    // Fresh content - full boost
    score += 1.0 * weights.completion;
  } else {
    // Completed - lower priority
    score += 0.2 * weights.completion;
  }

  // 4. Freshness vs revisit balance
  if (!content.lastViewedAt) {
    // Never viewed - fresh content boost
    score += 1.0 * weights.freshness;
  } else {
    const daysSinceView = (Date.now() - new Date(content.lastViewedAt).getTime()) / (1000 * 60 * 60 * 24);
    // Slight boost for content not seen recently
    score += Math.min(daysSinceView / 7, 1) * weights.freshness * 0.5;
  }

  // 5. Type preference (if we have history)
  const typePref = profile.typePreferences.get(content.type) ?? 0.5;
  score += typePref * weights.typePreference;

  // Add some randomness for exploration (5%)
  score += Math.random() * 0.05;

  return Math.max(0, Math.min(1, score));
}

function generateReason(content: ContentItem, profile: EngagementProfile): string {
  if (content.completionRate > 0 && content.completionRate < 0.9) {
    return `Continue where you left off (${Math.round(content.completionRate * 100)}% complete)`;
  }
  
  if (!content.lastViewedAt) {
    const ageInDays = (Date.now() - new Date(content.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays < 1) {
      return 'Added recently';
    }
    return 'Fresh content for you';
  }

  return 'Based on your reading patterns';
}
