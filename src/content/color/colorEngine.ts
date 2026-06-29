import type { ScannedElement } from '../scanner/cssomEngine';

export interface ColorPalette {
  primary: string;
  secondary: string;
  backgrounds: string[];
  texts: string[];
  all: string[];
}

export function rgbToHex(rgb: string): string {
  // Simple regex to match rgb(r, g, b) or rgba(r, g, b, a)
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgb;
  
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  
  return `#${r}${g}${b}`.toUpperCase();
}

/**
 * Extracts and normalizes colors from scanned elements.
 */
export function extractColors(elements: ScannedElement[]): ColorPalette {
  const colorMap = new Map<string, number>();
  const bgMap = new Map<string, number>();
  const textMap = new Map<string, number>();

  for (const el of elements) {
    const style = el.computedStyle;
    
    // Background Color
    if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent') {
      const hex = rgbToHex(style.backgroundColor);
      bgMap.set(hex, (bgMap.get(hex) || 0) + 1);
      colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
    }
    
    // Text Color
    if (style.color && style.color !== 'rgba(0, 0, 0, 0)' && style.color !== 'transparent') {
      const hex = rgbToHex(style.color);
      textMap.set(hex, (textMap.get(hex) || 0) + 1);
      colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
    }
    
    // Border Color
    if (style.borderColor && style.borderColor !== 'rgba(0, 0, 0, 0)' && style.borderColor !== 'transparent') {
       // Border color might be multiple colors like "red green blue yellow" but computed style usually resolves
       const hex = rgbToHex(style.borderColor);
       colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
    }
  }

  // Sort by frequency
  const sortMap = (map: Map<string, number>) => Array.from(map.entries()).sort((a, b) => b[1] - a[1]).map(e => e[0]);

  const allColors = sortMap(colorMap);
  
  // Basic heuristic: most common colors are primary/secondary or backgrounds
  return {
    primary: allColors[0] || '#000000',
    secondary: allColors[1] || '#FFFFFF',
    backgrounds: sortMap(bgMap).slice(0, 5), // Top 5 backgrounds
    texts: sortMap(textMap).slice(0, 5),     // Top 5 text colors
    all: allColors
  };
}
