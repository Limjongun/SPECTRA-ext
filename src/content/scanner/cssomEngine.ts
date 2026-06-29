export interface ScannedElement {
  tagName: string;
  id: string;
  className: string;
  text: string;
  rect: DOMRect;
  computedStyle: CSSStyleDeclaration;
  node: Element;
}

/**
 * Extracts the computed styles for an element.
 */
export function getComputedStyleObject(element: Element): CSSStyleDeclaration {
  return window.getComputedStyle(element);
}
