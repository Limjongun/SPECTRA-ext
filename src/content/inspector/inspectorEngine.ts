export type InspectorCallback = (element: HTMLElement) => void;

class InspectorEngine {
  private overlay: HTMLDivElement | null = null;
  private isActive: boolean = false;
  private currentElement: HTMLElement | null = null;
  private onSelectCallback: InspectorCallback | null = null;

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isActive || !this.overlay) return;
    
    // Find the element under the cursor (excluding our overlay)
    this.overlay.style.pointerEvents = 'none';
    const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
    this.overlay.style.pointerEvents = 'auto';

    if (!target || target === this.currentElement) return;

    if (target.tagName.toLowerCase() === 'html' || target.tagName.toLowerCase() === 'body') {
      return;
    }

    this.currentElement = target;
    const rect = target.getBoundingClientRect();

    this.overlay.style.top = `${rect.top + window.scrollY}px`;
    this.overlay.style.left = `${rect.left + window.scrollX}px`;
    this.overlay.style.width = `${rect.width}px`;
    this.overlay.style.height = `${rect.height}px`;
  };

  private handleClick = (e: MouseEvent) => {
    if (!this.isActive) return;
    
    e.preventDefault();
    e.stopPropagation();

    if (this.currentElement && this.onSelectCallback) {
      this.onSelectCallback(this.currentElement);
      this.stop();
    }
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.isActive) {
      this.stop();
    }
  };

  public start(onSelect: InspectorCallback) {
    if (this.isActive) return;
    this.isActive = true;
    this.onSelectCallback = onSelect;

    this.overlay = document.createElement('div');
    this.overlay.id = 'spectra-inspector-overlay';
    Object.assign(this.overlay.style, {
      position: 'absolute',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      border: '2px solid #3b82f6',
      borderRadius: '2px',
      zIndex: '2147483647',
      pointerEvents: 'auto',
      cursor: 'crosshair',
      transition: 'all 0.1s ease-out'
    });

    document.body.appendChild(this.overlay);

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('click', this.handleClick, true);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  public stop() {
    if (!this.isActive) return;
    this.isActive = false;
    this.currentElement = null;

    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
      this.overlay = null;
    }

    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('click', this.handleClick, true);
    document.removeEventListener('keydown', this.handleKeyDown);
  }
}

export const inspectorEngine = new InspectorEngine();
