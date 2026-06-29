import { scanDOM } from './content/scanner/domScanner';
import { extractColors } from './content/color/colorEngine';
import { extractTypography } from './content/typography/typographyEngine';

console.log("SPECTRA Content Script Injected");

import { inspectorEngine } from './content/inspector/inspectorEngine';
import { convertToJSX } from './content/converter/tailwindConverter';

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'SCAN_WEBSITE') {
    console.log("SPECTRA: Starting DOM Scan...");
    
    // 1. Scan DOM and extract CSSOM
    const scannedElements = scanDOM();
    console.log(`SPECTRA: Scanned ${scannedElements.length} visible elements.`);

    // 2. Extract Colors
    const colors = extractColors(scannedElements);
    
    // 3. Extract Typography
    const typography = extractTypography(scannedElements);

    const designTokens = {
      colors,
      typography
    };

    console.log("SPECTRA Design Tokens Generated:", designTokens);
    sendResponse({ success: true, data: designTokens });
  } else if (request.action === 'INSPECT_MODE_ON') {
    inspectorEngine.start(async (element) => {
      const jsxCode = convertToJSX(element);
      try {
        await navigator.clipboard.writeText(jsxCode);
        showToast('JSX Component Copied!');
      } catch (err) {
        console.error('Failed to copy', err);
      }
    });
    sendResponse({ success: true });
  }
  return true; // Keep the message channel open for async response
});

function showToast(message: string) {
  const toast = document.createElement('div');
  toast.innerText = message;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    fontFamily: 'system-ui, sans-serif',
    fontWeight: '500',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: '2147483647',
    opacity: '0',
    transform: 'translateY(20px)',
    transition: 'all 0.3s ease-out'
  });
  
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

