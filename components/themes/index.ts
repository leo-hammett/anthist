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
 * Get theme matching semantic tags
 */
export function getThemeForContent(semanticTags: string[], isDark: boolean): ReaderTheme {
  const filteredThemes = themes.filter(t => 
    isDark ? t.backgroundColor.startsWith('#0') || t.backgroundColor.startsWith('#1') 
           : !t.backgroundColor.startsWith('#0') && !t.backgroundColor.startsWith('#1')
  );
  
  // Find theme with most matching tags
  let bestMatch = filteredThemes[0];
  let bestScore = 0;
  
  for (const theme of filteredThemes) {
    const score = semanticTags.filter(tag => 
      theme.semanticTags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
    ).length;
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = theme;
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
