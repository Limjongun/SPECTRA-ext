import type { ScannedElement } from '../scanner/cssomEngine';

export interface TypographyTokens {
  fontFamilies: string[];
  sizes: string[];
  weights: string[];
}

/**
 * Extracts typography tokens from scanned elements.
 */
export function extractTypography(elements: ScannedElement[]): TypographyTokens {
  const families = new Set<string>();
  const sizes = new Set<string>();
  const weights = new Set<string>();

  for (const el of elements) {
    const style = el.computedStyle;

    // We only care about typography if there's actual text
    if (!el.text) continue;

    if (style.fontFamily) {
      // Clean up quotes from font families
      families.add(style.fontFamily.replace(/['"]/g, ''));
    }
    
    if (style.fontSize) {
      sizes.add(style.fontSize);
    }
    
    if (style.fontWeight) {
      weights.add(style.fontWeight);
    }
  }

  return {
    fontFamilies: Array.from(families).slice(0, 5), // Top 5 font families
    sizes: Array.from(sizes).sort((a, b) => parseFloat(a) - parseFloat(b)), // Sorted by size
    weights: Array.from(weights).sort((a, b) => parseInt(a) - parseInt(b)) // Sorted by weight
  };
}
