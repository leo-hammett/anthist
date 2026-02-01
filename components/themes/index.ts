/**
 * Theme System for Feed Reader
 * 
 * 100 beautifully crafted themes organized by:
 * - Dark themes (40) - for night reading
 * - Light themes (40) - for day reading  
 * - Specialty themes (20) - accessibility, seasonal, mood
 * 
 * Each theme has:
 * - Visual styling (colors, fonts, effects)
 * - Semantic tags it matches well with (tech, cooking, philosophy, etc.)
 * - Accessibility score (contrast ratio)
 */

import { allThemes, darkThemes, lightThemes, specialtyThemes } from './themes/all-themes';

export interface ReaderTheme {
  id: string;
  name: string;
  description: string;
  
  // Semantic matching
  semanticTags: string[]; // Content types this theme matches
  
  // Colors
  backgroundColor: string;
  textColor: string;
  headingColor?: string;
  linkColor: string;
  accentColor: string;
  codeBackgroundColor?: string;
  
  // Typography
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  
  // Effects (optional)
  backgroundPattern?: string; // CSS pattern or image
  textShadow?: string;
  
  // Accessibility
  contrastRatio: number; // WCAG standard
  isAccessible: boolean; // Meets WCAG AA (4.5:1)
}

// Re-export theme collections
export { allThemes, darkThemes, lightThemes, specialtyThemes };

// Use full theme collection
const themes = allThemes;

/**
 * Get theme by ID
 */
export function getThemeById(id: string): ReaderTheme | null {
  return themes.find(t => t.id === id) ?? null;
}

/**
 * Get default theme based on color scheme
 */
export function getDefaultTheme(isDark: boolean): ReaderTheme {
  return isDark 
    ? themes.find(t => t.id === 'dark-midnight') ?? darkThemes[0]
    : themes.find(t => t.id === 'light-paper') ?? lightThemes[0];
}

/**
 * Get theme matching semantic tags with smart matching
 * 
 * Scoring system:
 * - Exact tag match: 10 points
 * - Partial match (tag contains keyword): 5 points  
 * - Related category bonus: 3 points
 * - Exciting theme bonus: 2 points (themes with special effects)
 */
export function getThemeForContent(semanticTags: string[], isDark: boolean): ReaderTheme {
  // Filter by light/dark mode
  const filteredThemes = themes.filter(t => {
    const bg = t.backgroundColor.toLowerCase();
    // Check luminance - dark themes have low RGB values
    const hex = bg.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (r * 0.299 + g * 0.587 + b * 0.114);
    return isDark ? luminance < 60 : luminance >= 60;
  });
  
  if (!semanticTags || semanticTags.length === 0) {
    return getDefaultTheme(isDark);
  }

  // Related category mappings for better matches
  const categoryRelations: Record<string, string[]> = {
    'tech': ['programming', 'developer', 'coding', 'software', 'engineering', 'ai', 'data'],
    'programming': ['tech', 'developer', 'coding', 'software', 'engineering'],
    'cooking': ['food', 'recipes', 'baking', 'kitchen', 'culinary'],
    'food': ['cooking', 'recipes', 'baking', 'kitchen', 'culinary', 'restaurant'],
    'health': ['wellness', 'fitness', 'meditation', 'yoga', 'exercise'],
    'wellness': ['health', 'fitness', 'meditation', 'yoga', 'mindfulness'],
    'literature': ['books', 'fiction', 'reading', 'writing', 'poetry'],
    'science': ['research', 'academic', 'education', 'data', 'analysis'],
    'business': ['finance', 'professional', 'startup', 'entrepreneurship'],
    'nature': ['environment', 'outdoor', 'garden', 'ecology', 'wildlife'],
    'gaming': ['esports', 'entertainment', 'tech'],
    'art': ['creative', 'design', 'photography', 'visual'],
    'music': ['entertainment', 'creative', 'podcasts'],
  };

  // Exciting themes get a bonus (themes with special effects)
  const excitingThemeIds = [
    'dark-terminal', 'dark-matrix', 'dark-cyberpunk', 'dark-synthwave', 
    'dark-neon', 'dark-vapor', 'dark-aurora', 'dark-gaming', 'dark-dracula',
    'dark-monokai', 'dark-nord', 'light-studio', 'light-minimal',
    'accessibility-high-contrast', 'mood-mysterious', 'mood-energetic',
    'culture-zen-japanese', 'culture-arabic', 'brand-premium',
  ];

  let bestMatch = filteredThemes[0];
  let bestScore = 0;
  
  const normalizedContentTags = semanticTags.map(t => t.toLowerCase().trim());
  
  for (const theme of filteredThemes) {
    let score = 0;
    const themeTagsLower = theme.semanticTags.map(t => t.toLowerCase());
    
    for (const contentTag of normalizedContentTags) {
      // Exact match - highest priority
      if (themeTagsLower.includes(contentTag)) {
        score += 10;
        continue;
      }
      
      // Partial match - theme tag contains content tag or vice versa
      for (const themeTag of themeTagsLower) {
        if (themeTag.includes(contentTag) || contentTag.includes(themeTag)) {
          score += 5;
          break;
        }
      }
      
      // Related category match
      const relatedTags = categoryRelations[contentTag] || [];
      for (const relatedTag of relatedTags) {
        if (themeTagsLower.includes(relatedTag)) {
          score += 3;
          break;
        }
      }
    }
    
    // Bonus for exciting themes (to make it fun!)
    if (excitingThemeIds.includes(theme.id) && score > 0) {
      score += 2;
    }
    
    // Slight bonus for themes with text shadows (more visually interesting)
    if (theme.textShadow && score > 0) {
      score += 1;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = theme;
    }
  }
  
  // If no good match found (score < 3), pick a random exciting theme
  if (bestScore < 3) {
    const excitingFiltered = filteredThemes.filter(t => excitingThemeIds.includes(t.id));
    if (excitingFiltered.length > 0) {
      return excitingFiltered[Math.floor(Math.random() * excitingFiltered.length)];
    }
  }
  
  return bestMatch;
}

/**
 * Get all themes
 */
export function getAllThemes(): ReaderTheme[] {
  return themes;
}

/**
 * Get themes by category
 */
export function getThemesByCategory(category: 'dark' | 'light' | 'specialty'): ReaderTheme[] {
  switch (category) {
    case 'dark':
      return darkThemes;
    case 'light':
      return lightThemes;
    case 'specialty':
      return specialtyThemes;
  }
}

export { themes };
