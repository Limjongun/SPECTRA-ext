import { rgbToHex } from '../color/colorEngine';

export function convertToJSX(element: HTMLElement, depth: number = 0, maxDepth: number = 8): string {
  if (depth > maxDepth) return `${'  '.repeat(depth)}{/* max depth reached */}`;

  const styles = window.getComputedStyle(element);
  const classes = getTailwindClasses(styles);
  
  let tagName = element.tagName.toLowerCase();
  
  // Phase 7: Framer motion detection (if animation is present)
  let motionPrefix = '';
  if (styles.animationName && styles.animationName !== 'none') {
    motionPrefix = 'motion.';
  }

  const tag = `${motionPrefix}${tagName}`;
  const indentStr = '  '.repeat(depth);

  // SVG Specific attributes
  let extraAttributes = '';
  if (tagName === 'svg') {
    extraAttributes = ` viewBox="${element.getAttribute('viewBox') || '0 0 24 24'}" fill="${element.getAttribute('fill') || 'none'}" stroke="${element.getAttribute('stroke') || 'currentColor'}"`;
  }
  if (tagName === 'path') {
    extraAttributes = ` d="${element.getAttribute('d') || ''}" strokeLinecap="round" strokeLinejoin="round"`;
  }
  if (tagName === 'img') {
    extraAttributes = ` src="${element.getAttribute('src') || ''}" alt="${element.getAttribute('alt') || ''}"`;
  }

  const classString = classes.length > 0 ? ` className="${classes}"` : '';
  const isSelfClosing = ['img', 'input', 'br', 'hr', 'path', 'circle', 'line', 'rect', 'polygon'].includes(tagName);

  if (isSelfClosing) {
    return `${indentStr}<${tag}${classString}${extraAttributes} />`;
  }

  // Children handling (Phase 6)
  let innerContent = '';
  
  // Check if it's mostly a text node container or has HTML children
  if (element.children.length > 0) {
    const childrenJSX = Array.from(element.children).map(child => {
      return convertToJSX(child as HTMLElement, depth + 1, maxDepth);
    }).join('\n');
    innerContent = `\n${childrenJSX}\n${indentStr}`;
  } else {
    // Escape standard text
    let text = element.innerText?.trim();
    if (text) {
      // Basic escaping for JSX
      text = text.replace(/{/g, '&#123;').replace(/}/g, '&#125;');
      innerContent = text;
    }
  }

  return `${indentStr}<${tag}${classString}${extraAttributes}>${innerContent}</${tag}>`;
}

function getTailwindClasses(style: CSSStyleDeclaration): string {
  const classes: string[] = [];

  // Layout & Display
  if (style.display === 'flex') {
    classes.push('flex');
    if (style.flexDirection === 'column') classes.push('flex-col');
    if (style.alignItems === 'center') classes.push('items-center');
    if (style.justifyContent === 'center') classes.push('justify-center');
    if (style.justifyContent === 'space-between') classes.push('justify-between');
    if (style.gap && style.gap !== 'normal') classes.push(`gap-[${style.gap}]`);
  } else if (style.display === 'grid') {
    classes.push('grid');
    if (style.gap && style.gap !== 'normal') classes.push(`gap-[${style.gap}]`);
  }

  // Dimension limitations (to avoid massive absolute sizes, we just extract it if it's explicitly set and small, else skip for fluidity)
  // For simplicity we extract exact bounds
  // if (style.width && style.width !== 'auto') classes.push(`w-[${style.width}]`);
  // if (style.height && style.height !== 'auto') classes.push(`h-[${style.height}]`);

  // Padding
  if (style.padding && style.padding !== '0px') {
    classes.push(`p-[${style.padding}]`);
  } else {
    if (style.paddingTop !== '0px') classes.push(`pt-[${style.paddingTop}]`);
    if (style.paddingRight !== '0px') classes.push(`pr-[${style.paddingRight}]`);
    if (style.paddingBottom !== '0px') classes.push(`pb-[${style.paddingBottom}]`);
    if (style.paddingLeft !== '0px') classes.push(`pl-[${style.paddingLeft}]`);
  }

  // Margin
  if (style.margin && style.margin !== '0px') {
    classes.push(`m-[${style.margin}]`);
  } else {
    if (style.marginTop !== '0px') classes.push(`mt-[${style.marginTop}]`);
    if (style.marginBottom !== '0px') classes.push(`mb-[${style.marginBottom}]`);
  }

  // Typography
  if (style.fontSize) classes.push(`text-[${style.fontSize}]`);
  if (style.fontWeight && style.fontWeight !== '400') classes.push(`font-[${style.fontWeight}]`);
  if (style.textAlign && style.textAlign !== 'start' && style.textAlign !== 'left') {
    classes.push(`text-${style.textAlign}`);
  }

  // Colors
  if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
    classes.push(`bg-[${rgbToHex(style.backgroundColor)}]`);
  }
  if (style.color) {
    classes.push(`text-[${rgbToHex(style.color)}]`);
  }

  // Border & Radius
  if (style.borderWidth && style.borderWidth !== '0px') {
    classes.push(`border-[${style.borderWidth}]`);
    if (style.borderColor) classes.push(`border-[${rgbToHex(style.borderColor)}]`);
  }
  if (style.borderRadius && style.borderRadius !== '0px') {
    classes.push(`rounded-[${style.borderRadius}]`);
  }

  // Shadow
  if (style.boxShadow && style.boxShadow !== 'none') {
    classes.push('shadow-lg'); 
  }

  // Phase 7: Interactive States & Transitions
  if (style.cursor === 'pointer') {
    classes.push('cursor-pointer');
    classes.push('hover:opacity-80'); // Generic hover state for interactive elements
  }

  if (style.transitionDuration && style.transitionDuration !== '0s') {
    classes.push('transition-all');
    if (style.transitionDuration !== '0.15s') { // Tailwind default is 150ms
      classes.push(`duration-[${style.transitionDuration}]`);
    }
  }

  // Ensure unique classes
  return Array.from(new Set(classes)).join(' ');
}
