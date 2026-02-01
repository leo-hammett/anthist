/**
 * Animation Selection Algorithm
 * 
 * Selects swipe animation style based on:
 * - Content type (video vs blog vs PDF)
 * - Time of day (calm animations at night)
 * - User engagement patterns
 * - Random variation for delight
 */

export type AnimationStyle = 
  | 'parallax'      // Default smooth parallax
  | 'stack'         // Cards stacking
  | 'fade'          // Crossfade transition
  | 'rotate'        // 3D rotation
  | 'cube'          // 3D cube rotation
  | 'tinder'        // Tinder-style card swipe
  | 'page-turn'     // Book page turn effect
  | 'zoom'          // Zoom in/out
  | 'slide'         // Simple slide
  | 'creative';     // Random creative effects

export interface AnimationConfig {
  style: AnimationStyle;
  duration: number;      // ms
  easing: string;        // CSS easing function
  parallaxScale?: number;
  rotationAngle?: number;
}

// Animation presets
const animationPresets: Record<AnimationStyle, Omit<AnimationConfig, 'style'>> = {
  parallax: {
    duration: 400,
    easing: 'ease-out',
    parallaxScale: 0.9,
  },
  stack: {
    duration: 350,
    easing: 'ease-in-out',
  },
  fade: {
    duration: 300,
    easing: 'ease',
  },
  rotate: {
    duration: 500,
    easing: 'ease-out',
    rotationAngle: 30,
  },
  cube: {
    duration: 600,
    easing: 'ease-in-out',
    rotationAngle: 90,
  },
  tinder: {
    duration: 400,
    easing: 'ease-out',
    rotationAngle: 15,
  },
  'page-turn': {
    duration: 600,
    easing: 'ease-in-out',
  },
  zoom: {
    duration: 400,
    easing: 'ease-out',
    parallaxScale: 0.8,
  },
  slide: {
    duration: 300,
    easing: 'linear',
  },
  creative: {
    duration: 500,
    easing: 'ease-in-out',
  },
};

// Animation suitability by content type
const animationsByContentType: Record<string, AnimationStyle[]> = {
  BLOG: ['parallax', 'page-turn', 'fade', 'slide', 'zoom'],
  YOUTUBE: ['parallax', 'fade', 'slide', 'cube'],
  PDF: ['page-turn', 'parallax', 'slide'],
  PLAYLIST_VIDEO: ['parallax', 'fade', 'tinder'],
};

// Calm animations for night reading (after 9pm, before 6am)
const calmAnimations: AnimationStyle[] = ['fade', 'parallax', 'slide'];

// Energetic animations for daytime
const energeticAnimations: AnimationStyle[] = ['cube', 'rotate', 'tinder', 'creative'];

/**
 * Select animation style based on context
 */
export function selectAnimation(
  contentType: string,
  hour: number,
  engagementVariance: number = 0.5
): AnimationConfig {
  // Determine if it's "calm" hours (night reading)
  const isNightTime = hour >= 21 || hour < 6;
  
  // Get suitable animations for content type
  const suitableAnimations = animationsByContentType[contentType] ?? animationsByContentType.BLOG;
  
  // Filter by time of day
  let availableAnimations: AnimationStyle[];
  
  if (isNightTime) {
    // Prefer calm animations at night
    availableAnimations = suitableAnimations.filter(a => calmAnimations.includes(a));
    if (availableAnimations.length === 0) {
      availableAnimations = calmAnimations;
    }
  } else {
    // Mix it up during the day based on engagement variance
    if (engagementVariance > 0.7) {
      // High variance = user likes variety, include energetic
      availableAnimations = [
        ...suitableAnimations,
        ...energeticAnimations.filter(a => !suitableAnimations.includes(a)),
      ];
    } else {
      availableAnimations = suitableAnimations;
    }
  }
  
  // Random selection with weighting towards parallax (most reliable)
  const weights: Record<AnimationStyle, number> = {
    parallax: 3,
    fade: 2,
    slide: 2,
    'page-turn': 2,
    stack: 1,
    zoom: 1,
    rotate: 1,
    cube: 1,
    tinder: 1,
    creative: 0.5,
  };
  
  // Weighted random selection
  const totalWeight = availableAnimations.reduce((sum, a) => sum + (weights[a] ?? 1), 0);
  let random = Math.random() * totalWeight;
  
  let selectedStyle: AnimationStyle = 'parallax';
  for (const animation of availableAnimations) {
    random -= weights[animation] ?? 1;
    if (random <= 0) {
      selectedStyle = animation;
      break;
    }
  }
  
  // Get preset and return config
  const preset = animationPresets[selectedStyle];
  
  return {
    style: selectedStyle,
    ...preset,
  };
}

/**
 * Get animation configuration for react-native-reanimated-carousel
 */
export function getCarouselAnimationConfig(config: AnimationConfig) {
  switch (config.style) {
    case 'parallax':
      return {
        mode: 'parallax' as const,
        modeConfig: {
          parallaxScrollingScale: config.parallaxScale ?? 0.9,
          parallaxScrollingOffset: 50,
        },
        scrollAnimationDuration: config.duration,
      };
    
    case 'stack':
      return {
        mode: 'horizontal-stack' as const,
        modeConfig: {
          snapDirection: 'left' as const,
          stackInterval: 18,
        },
        scrollAnimationDuration: config.duration,
      };
    
    case 'fade':
      return {
        mode: 'parallax' as const,
        modeConfig: {
          parallaxScrollingScale: 1,
          parallaxScrollingOffset: 0,
          parallaxAdjacentItemScale: 0.8,
        },
        scrollAnimationDuration: config.duration,
      };
    
    case 'cube':
    case 'rotate':
      return {
        mode: 'parallax' as const,
        modeConfig: {
          parallaxScrollingScale: 0.85,
          parallaxScrollingOffset: 100,
        },
        scrollAnimationDuration: config.duration,
      };
    
    case 'tinder':
      return {
        mode: 'parallax' as const,
        modeConfig: {
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 40,
        },
        scrollAnimationDuration: config.duration,
      };
    
    case 'zoom':
      return {
        mode: 'parallax' as const,
        modeConfig: {
          parallaxScrollingScale: config.parallaxScale ?? 0.8,
          parallaxScrollingOffset: 100,
        },
        scrollAnimationDuration: config.duration,
      };
    
    case 'page-turn':
    case 'slide':
    default:
      return {
        mode: 'parallax' as const,
        modeConfig: {
          parallaxScrollingScale: 0.95,
          parallaxScrollingOffset: 30,
        },
        scrollAnimationDuration: config.duration,
      };
  }
}

/**
 * Calculate user's engagement variance from history
 * High variance = user interacts differently with different content
 */
export function calculateEngagementVariance(
  engagements: Array<{ timeSpent: number; scrollDepth: number }>
): number {
  if (engagements.length < 2) return 0.5;
  
  // Calculate variance of normalized engagement scores
  const scores = engagements.map(e => {
    const timeScore = Math.min(e.timeSpent / (5 * 60 * 1000), 1); // Cap at 5 min
    const depthScore = e.scrollDepth;
    return (timeScore + depthScore) / 2;
  });
  
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((acc, s) => acc + Math.pow(s - mean, 2), 0) / scores.length;
  
  // Normalize variance to 0-1 range
  return Math.min(Math.sqrt(variance) * 2, 1);
}
