import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, ScanEye, Code2, Download, Settings, History, CheckCircle2, Loader2, MousePointer2 } from 'lucide-react';

function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'SCAN_WEBSITE' });
        if (response && response.success) {
          setScanResult(response.data);
        }
      }
    } catch (error) {
      console.error("Scan failed:", error);
    } finally {
      setIsScanning(false);
    }
  };
  const [exportState, setExportState] = useState<'idle' | 'tailwind' | 'css'>('idle');

  const handleExportTailwind = async () => {
    if (!scanResult) return;
    const config = `module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '${scanResult.colors.primary}',
        secondary: '${scanResult.colors.secondary}',
        background: '${scanResult.colors.backgrounds[0] || '#ffffff'}',
        text: '${scanResult.colors.texts[0] || '#000000'}',
      },
      fontFamily: {
        sans: ['${scanResult.typography.fontFamilies.join("', '")}'],
      }
    }
  }
}`;
    await navigator.clipboard.writeText(config);
    setExportState('tailwind');
    setTimeout(() => setExportState('idle'), 2000);
  };

  const handleExportCSS = async () => {
    if (!scanResult) return;
    const css = `:root {
  --color-primary: ${scanResult.colors.primary};
  --color-secondary: ${scanResult.colors.secondary};
  --color-background: ${scanResult.colors.backgrounds[0] || '#ffffff'};
  --color-text: ${scanResult.colors.texts[0] || '#000000'};
  --font-primary: ${scanResult.typography.fontFamilies[0] || 'sans-serif'};
}`;
    await navigator.clipboard.writeText(css);
    setExportState('css');
    setTimeout(() => setExportState('idle'), 2000);
  };

  const handleInspect = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'INSPECT_MODE_ON' });
        window.close(); // Close popup so user can interact with the page
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full h-full min-h-[500px] bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="p-4 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Fingerprint className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
            SPECTRA
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <History className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {!scanResult ? (
            <motion.div 
              key="hero"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-6 text-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4 relative"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-500/10 to-purple-500/10 animate-pulse" />
                <ScanEye className="w-10 h-10 text-purple-400" />
              </motion.div>
              <h2 className="text-xl font-medium mb-1">Analyze Design DNA</h2>
              <p className="text-sm text-muted-foreground max-w-[250px]">
                Extract tokens, colors, and layout from the current page.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
              <div className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-sm">Scan Complete</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Colors Section */}
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">All Colors</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {scanResult.colors.all.map((color: string, index: number) => (
                        <div key={index} className="flex flex-col items-center gap-1">
                          <div 
                            className="w-8 h-8 rounded-full border border-border/50 shadow-sm" 
                            style={{ backgroundColor: color }} 
                            title={color}
                          />
                          <span className="text-[10px] font-mono text-muted-foreground">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Typography Section */}
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Typography</span>
                    
                    <div className="mt-2 space-y-2">
                      <div>
                        <span className="text-[11px] text-muted-foreground mb-1 block">Font Families</span>
                        <div className="max-h-24 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                          {scanResult.typography.fontFamilies.map((font: string, i: number) => (
                            <div key={i} className="px-2 py-1.5 bg-muted/50 rounded-md text-xs truncate border border-border/50">
                              <span style={{ fontFamily: font }}>{font}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="p-2 bg-muted/30 rounded-lg border border-border/50">
                          <span className="text-[11px] text-muted-foreground block mb-1">Sizes</span>
                          <div className="flex flex-wrap gap-1">
                            {scanResult.typography.sizes.slice(0, 4).map((size: string, i: number) => (
                              <span key={i} className="text-xs px-1.5 bg-background rounded border border-border">{size}</span>
                            ))}
                            {scanResult.typography.sizes.length > 4 && <span className="text-[10px] text-muted-foreground">+{scanResult.typography.sizes.length - 4}</span>}
                          </div>
                        </div>
                        <div className="p-2 bg-muted/30 rounded-lg border border-border/50">
                          <span className="text-[11px] text-muted-foreground block mb-1">Weights</span>
                          <div className="flex flex-wrap gap-1">
                            {scanResult.typography.weights.slice(0, 4).map((weight: string, i: number) => (
                              <span key={i} className="text-xs px-1.5 bg-background rounded border border-border">{weight}</span>
                            ))}
                            {scanResult.typography.weights.length > 4 && <span className="text-[10px] text-muted-foreground">+{scanResult.typography.weights.length - 4}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleScan}
            disabled={isScanning}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-70 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <ScanEye className="w-5 h-5" />}
            {isScanning ? 'Scanning...' : (scanResult ? 'Rescan Website' : 'Scan Website')}
          </button>
          
          <button 
            onClick={handleInspect}
            className="w-full py-3 px-4 rounded-xl border border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <MousePointer2 className="w-5 h-5" />
            Inspect Component (JSX)
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div 
            onClick={handleExportTailwind}
            className={`p-4 rounded-xl border transition-colors group ${scanResult ? 'cursor-pointer hover:border-purple-500/50 bg-card' : 'opacity-50 cursor-not-allowed bg-muted/50 border-transparent'}`}
          >
            {exportState === 'tailwind' ? (
              <CheckCircle2 className="w-6 h-6 text-green-500 mb-2 transition-transform" />
            ) : (
              <Code2 className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            )}
            <h3 className="font-medium text-sm">Tailwind Config</h3>
            <p className="text-xs text-muted-foreground mt-1">{exportState === 'tailwind' ? 'Copied!' : 'Export tokens'}</p>
          </div>
          <div 
            onClick={handleExportCSS}
            className={`p-4 rounded-xl border transition-colors group ${scanResult ? 'cursor-pointer hover:border-blue-500/50 bg-card' : 'opacity-50 cursor-not-allowed bg-muted/50 border-transparent'}`}
          >
            {exportState === 'css' ? (
              <CheckCircle2 className="w-6 h-6 text-green-500 mb-2 transition-transform" />
            ) : (
              <Download className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            )}
            <h3 className="font-medium text-sm">CSS Variables</h3>
            <p className="text-xs text-muted-foreground mt-1">{exportState === 'css' ? 'Copied!' : 'Export CSS'}</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>Ready to scan</span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          Connected
        </span>
      </footer>
    </div>
  );
}

export default App;
