/**
 * OpenAI Embeddings Integration
 * 
 * Generates embeddings for:
 * - Content titles and descriptions
 * - User engagement patterns
 * - Theme matching
 */

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  tokens: number;
}

// OpenAI embedding dimensions
const EMBEDDING_DIMENSIONS = 1536; // text-embedding-3-small

/**
 * Generate embedding via Lambda function
 * (Actual API call happens server-side to protect API key)
 */
export async function generateEmbedding(
  text: string,
  lambdaInvokeUrl: string
): Promise<EmbeddingResult | null> {
  try {
    const response = await fetch(lambdaInvokeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    return null;
  }
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have same dimension');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  
  if (magnitude === 0) return 0;
  
  return dotProduct / magnitude;
}

/**
 * Find most similar content based on embeddings
 */
export function findSimilarContent(
  targetEmbedding: number[],
  contentEmbeddings: Array<{ id: string; embedding: number[] }>,
  topK: number = 5
): Array<{ id: string; similarity: number }> {
  const similarities = contentEmbeddings.map(item => ({
    id: item.id,
    similarity: cosineSimilarity(targetEmbedding, item.embedding),
  }));

  // Sort by similarity descending
  similarities.sort((a, b) => b.similarity - a.similarity);

  return similarities.slice(0, topK);
}

/**
 * Generate content embedding text
 * Combines title, description, and semantic tags
 */
export function prepareEmbeddingText(
  title: string,
  description?: string,
  semanticTags?: string[]
): string {
  const parts: string[] = [title];
  
  if (description) {
    parts.push(description);
  }
  
  if (semanticTags && semanticTags.length > 0) {
    parts.push(`Tags: ${semanticTags.join(', ')}`);
  }
  
  return parts.join('\n\n');
}

/**
 * Parse embedding from JSON string (stored in DynamoDB)
 */
export function parseEmbedding(embeddingJson: string | null): number[] | null {
  if (!embeddingJson) return null;
  
  try {
    const parsed = JSON.parse(embeddingJson);
    if (Array.isArray(parsed) && parsed.length === EMBEDDING_DIMENSIONS) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Serialize embedding to JSON string for storage
 */
export function serializeEmbedding(embedding: number[]): string {
  return JSON.stringify(embedding);
}

/**
 * Create a user preference embedding from engagement history
 * Weighted average of embeddings from high-engagement content
 */
export function createUserPreferenceEmbedding(
  engagements: Array<{
    contentId: string;
    timeSpent: number;
    scrollDepth: number;
    completionRate: number;
  }>,
  contentEmbeddings: Map<string, number[]>
): number[] | null {
  // Calculate engagement scores
  const scored = engagements.map(e => {
    const embedding = contentEmbeddings.get(e.contentId);
    if (!embedding) return null;
    
    // Engagement score based on multiple signals
    const score = 
      Math.min(e.timeSpent / (5 * 60 * 1000), 1) * 0.4 + // Time (cap 5 min)
      e.scrollDepth * 0.3 +
      e.completionRate * 0.3;
    
    return { embedding, score };
  }).filter((x): x is { embedding: number[]; score: number } => x !== null);
  
  if (scored.length === 0) return null;
  
  // Calculate weighted average
  const totalScore = scored.reduce((sum, s) => sum + s.score, 0);
  const result = new Array(EMBEDDING_DIMENSIONS).fill(0);
  
  for (const { embedding, score } of scored) {
    const weight = score / totalScore;
    for (let i = 0; i < EMBEDDING_DIMENSIONS; i++) {
      result[i] += embedding[i] * weight;
    }
  }
  
  // Normalize the result
  const magnitude = Math.sqrt(result.reduce((sum, v) => sum + v * v, 0));
  if (magnitude > 0) {
    for (let i = 0; i < EMBEDDING_DIMENSIONS; i++) {
      result[i] /= magnitude;
    }
  }
  
  return result;
}

/**
 * Match content embedding to theme embeddings
 * Returns best matching theme ID
 */
export function matchEmbeddingToTheme(
  contentEmbedding: number[],
  themeEmbeddings: Map<string, number[]>
): string | null {
  let bestTheme: string | null = null;
  let bestSimilarity = -1;
  
  for (const [themeId, themeEmbedding] of themeEmbeddings) {
    const similarity = cosineSimilarity(contentEmbedding, themeEmbedding);
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestTheme = themeId;
    }
  }
  
  return bestTheme;
}
