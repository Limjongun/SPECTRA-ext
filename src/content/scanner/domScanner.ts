import type { ScannedElement } from './cssomEngine';
import { getComputedStyleObject } from './cssomEngine';

/**
 * Scans the DOM and extracts visible elements with their styles.
 */
export function scanDOM(): ScannedElement[] {
  const elements = Array.from(document.querySelectorAll('*'));
  const scanned: ScannedElement[] = [];

  for (const el of elements) {
    // Ignore script, style, and invisible elements
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'HEAD', 'TITLE', 'LINK'].includes(el.tagName)) {
      continue;
    }

    const rect = el.getBoundingClientRect();
    const style = getComputedStyleObject(el);

    // Simple visibility check
    if (rect.width === 0 || rect.height === 0 || style.display === 'none' || style.opacity === '0' || style.visibility === 'hidden') {
      continue;
    }

    scanned.push({
      tagName: el.tagName,
      id: el.id,
      className: el.className,
      text: (el as HTMLElement).innerText?.trim().slice(0, 50) || '',
      rect,
      computedStyle: style,
      node: el
    });
  }

  return scanned;
}
