import React, { useState, useRef } from 'react';
import { enhanceArchitecturalImage } from './services/geminiService';
import { ImageFile } from './types';
import { Spinner } from './components/Spinner';
import { Button } from './components/Button';
import { CompareSlider } from './components/CompareSlider';

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'night'>('day');
  const [addBackground, setAddBackground] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    setEnhancedImageUrl(null);
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      const mimeType = result.split(';')[0].split(':')[1];

      setSelectedImage({
        file,
        previewUrl: result,
        base64,
        mimeType,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleEnhance = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);

    try {
      const enhancedBase64 = await enhanceArchitecturalImage(
        selectedImage.base64,
        selectedImage.mimeType,
        customPrompt,
        timeOfDay,
        addBackground
      );
      setEnhancedImageUrl(enhancedBase64);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while enhancing the image.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setEnhancedImageUrl(null);
    setError(null);
    setCustomPrompt('');
    setAddBackground(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (!enhancedImageUrl) return;
    const link = document.createElement('a');
    link.href = enhancedImageUrl;
    link.download = `archienhance_${timeOfDay}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-arch-dark blueprint-grid">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-arch-gold/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-arch-blueprint/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 md:px-12 py-6 flex items-center justify-between border-b border-arch-steel/30">
          <div className="flex items-center gap-4">
            {/* Logo mark */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 border border-arch-gold/50 rotate-45" />
              <div className="absolute inset-2 bg-arch-gold/10 rotate-45" />
              <span className="relative text-arch-gold font-display text-sm">A</span>
            </div>
            <div>
              <h1 className="font-display text-xl md:text-2xl text-arch-mist tracking-wide">
                ARCHIENHANCE
              </h1>
              <p className="text-arch-mist/40 text-xs font-mono tracking-widest">
                AI VISUALIZATION
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-arch-mist/30 text-xs font-mono">
            <div className="w-1.5 h-1.5 rounded-full bg-arch-gold animate-pulse" />
            <span>Powered by Gemini 2.5 Flash</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Left Panel: Controls */}
              <div className="lg:col-span-4 space-y-6 animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
                {/* Upload Section */}
                <section className="glass-panel p-6 corner-accent relative">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-6 h-6 border border-arch-gold/50 rotate-45 flex items-center justify-center">
                      <span className="text-arch-gold text-xs font-mono -rotate-45">01</span>
                    </div>
                    <h2 className="text-arch-cream font-medium tracking-wide">Upload Source</h2>
                  </div>

                  <div
                    className={`
                      relative border-2 border-dashed p-8 transition-all duration-300 cursor-pointer
                      ${isDragOver
                        ? 'border-arch-gold bg-arch-gold/5'
                        : selectedImage
                          ? 'border-arch-gold/30 bg-arch-gold/5'
                          : 'border-arch-steel hover:border-arch-gold/50 hover:bg-arch-steel/30'
                      }
                    `}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />

                    {selectedImage ? (
                      <div className="text-center space-y-3">
                        <div className="w-14 h-14 mx-auto border border-arch-gold/50 rotate-45 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-arch-gold -rotate-45"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-arch-cream text-sm font-medium truncate max-w-[200px] mx-auto">
                          {selectedImage.file.name}
                        </p>
                        <p className="text-arch-mist/40 text-xs font-mono">Click to change</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="w-14 h-14 mx-auto border border-arch-steel rotate-45 flex items-center justify-center transition-colors group-hover:border-arch-gold/50">
                          <svg
                            className="w-6 h-6 text-arch-mist/50 -rotate-45"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-arch-cream text-sm font-medium">Drop your render here</p>
                          <p className="text-arch-mist/40 text-xs mt-1">or click to browse</p>
                        </div>
                        <p className="text-arch-mist/30 text-xs font-mono">JPG, PNG supported</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Settings Section */}
                <section className="glass-panel p-6 corner-accent relative">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-6 h-6 border border-arch-gold/50 rotate-45 flex items-center justify-center">
                      <span className="text-arch-gold text-xs font-mono -rotate-45">02</span>
                    </div>
                    <h2 className="text-arch-cream font-medium tracking-wide">Parameters</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Time of Day Selection */}
                    <div>
                      <label className="block text-arch-mist/60 text-xs font-mono tracking-wider uppercase mb-3">
                        Lighting Mode
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setTimeOfDay('day')}
                          disabled={loading}
                          className={`
                            relative p-4 border transition-all duration-300 flex flex-col items-center gap-2
                            ${timeOfDay === 'day'
                              ? 'bg-gradient-to-b from-amber-500/10 to-transparent border-amber-500/50 text-amber-200'
                              : 'bg-arch-charcoal border-arch-steel text-arch-mist/50 hover:border-arch-steel hover:text-arch-mist/70'
                            }
                          `}
                        >
                          {timeOfDay === 'day' && (
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-400 rotate-45" />
                          )}
                          <svg
                            className={`w-7 h-7 ${timeOfDay === 'day' ? 'text-amber-400' : 'text-arch-mist/40'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                          <span className="text-xs font-medium tracking-wide">Daytime</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTimeOfDay('night')}
                          disabled={loading}
                          className={`
                            relative p-4 border transition-all duration-300 flex flex-col items-center gap-2
                            ${timeOfDay === 'night'
                              ? 'bg-gradient-to-b from-indigo-500/10 to-transparent border-indigo-500/50 text-indigo-200'
                              : 'bg-arch-charcoal border-arch-steel text-arch-mist/50 hover:border-arch-steel hover:text-arch-mist/70'
                            }
                          `}
                        >
                          {timeOfDay === 'night' && (
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-400 rotate-45" />
                          )}
                          <svg
                            className={`w-7 h-7 ${timeOfDay === 'night' ? 'text-indigo-400' : 'text-arch-mist/40'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                            />
                          </svg>
                          <span className="text-xs font-medium tracking-wide">Nighttime</span>
                        </button>
                      </div>
                    </div>

                    {/* Background Toggle */}
                    <div>
                      <label
                        className={`
                          flex items-center gap-4 p-4 border cursor-pointer transition-all duration-300
                          ${addBackground
                            ? 'bg-arch-gold/5 border-arch-gold/30'
                            : 'bg-arch-charcoal border-arch-steel hover:border-arch-steel'
                          }
                        `}
                      >
                        <div
                          className={`
                            relative w-5 h-5 border rotate-45 flex items-center justify-center transition-colors
                            ${addBackground ? 'bg-arch-gold border-arch-gold' : 'border-arch-steel'}
                          `}
                        >
                          {addBackground && (
                            <svg className="w-3 h-3 text-arch-dark -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={addBackground}
                            onChange={(e) => setAddBackground(e.target.checked)}
                            disabled={loading}
                          />
                        </div>
                        <div className="flex-1">
                          <span className={`block text-sm font-medium ${addBackground ? 'text-arch-gold' : 'text-arch-cream'}`}>
                            Auto-fill Background
                          </span>
                          <span className="block text-xs text-arch-mist/40 mt-0.5">
                            Generate contextual scenery
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Custom Prompt */}
                    <div>
                      <label className="block text-arch-mist/60 text-xs font-mono tracking-wider uppercase mb-2">
                        Additional Instructions
                      </label>
                      <textarea
                        className="
                          w-full bg-arch-charcoal border border-arch-steel p-4
                          text-sm text-arch-cream placeholder-arch-mist/30
                          focus:outline-none focus:border-arch-gold/50
                          transition-colors duration-200 resize-none h-24
                        "
                        placeholder="e.g., Add vintage filter, emphasize glass reflections..."
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        disabled={loading || !selectedImage}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-2">
                      <Button
                        onClick={handleEnhance}
                        disabled={!selectedImage || loading}
                        isLoading={loading}
                        size="lg"
                        className="w-full"
                      >
                        {loading ? 'Processing...' : 'Generate Enhancement'}
                      </Button>

                      {enhancedImageUrl && (
                        <Button variant="secondary" onClick={handleReset} className="w-full">
                          Start New Project
                        </Button>
                      )}
                    </div>
                  </div>
                </section>

                {/* Info Panel */}
                <section className="p-5 border border-arch-blueprint/30 bg-arch-blueprint/5">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 border border-arch-blueprint/50 rotate-45 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <span className="text-arch-blueprint text-[10px] -rotate-45">i</span>
                    </div>
                    <div className="text-xs text-arch-mist/50 space-y-2">
                      <p className="text-arch-mist/70 font-medium">Processing Pipeline</p>
                      <ul className="space-y-1.5 font-mono">
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-arch-gold/50 rotate-45" />
                          Structure analysis
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-arch-gold/50 rotate-45" />
                          {timeOfDay === 'day' ? 'Daylight' : 'Night'} GI enhancement
                        </li>
                        {addBackground && (
                          <li className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-arch-gold/50 rotate-45" />
                            Background generation
                          </li>
                        )}
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-arch-gold/50 rotate-45" />
                          Texture refinement
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Panel: Preview & Results */}
              <div className="lg:col-span-8 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
                {/* Error Alert */}
                {error && (
                  <div className="mb-6 p-4 border border-red-500/30 bg-red-500/5 flex items-start gap-4">
                    <div className="w-6 h-6 border border-red-500/50 rotate-45 flex-shrink-0 flex items-center justify-center">
                      <span className="text-red-400 text-xs -rotate-45">!</span>
                    </div>
                    <div>
                      <p className="text-red-300 font-medium text-sm">Processing Error</p>
                      <p className="text-red-300/70 text-xs mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {/* Preview Container */}
                <div className="glass-panel gold-glow min-h-[600px] relative flex items-center justify-center overflow-hidden corner-accent">
                  {/* Empty State */}
                  {!selectedImage && !loading && (
                    <div className="text-center p-12 animate-fade-in-up">
                      <div className="relative w-32 h-32 mx-auto mb-8">
                        <div className="absolute inset-0 border border-arch-steel/30 rotate-45" />
                        <div className="absolute inset-4 border border-arch-steel/20 rotate-45" />
                        <div className="absolute inset-8 border border-arch-steel/10 rotate-45" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-10 h-10 text-arch-mist/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-arch-cream text-xl font-display tracking-wide mb-3">
                        READY TO VISUALIZE
                      </h3>
                      <p className="text-arch-mist/40 text-sm max-w-md mx-auto leading-relaxed">
                        Upload your architectural sketch or render to experience AI-powered enhancement with professional-grade lighting and detail refinement.
                      </p>
                    </div>
                  )}

                  {/* Loading State */}
                  {loading && (
                    <div className="absolute inset-0 z-20 bg-arch-dark/95 flex items-center justify-center backdrop-blur-sm">
                      <Spinner message={`Generating ${timeOfDay === 'day' ? 'daytime' : 'nighttime'} visualization...`} />
                    </div>
                  )}

                  {/* Before only (Initial Upload) */}
                  {selectedImage && !enhancedImageUrl && !loading && (
                    <div className="relative w-full h-full p-6 flex items-center justify-center animate-scale-in">
                      <div className="relative max-w-full max-h-[550px]">
                        <img
                          src={selectedImage.previewUrl}
                          alt="Original"
                          className="max-w-full max-h-[550px] object-contain"
                        />
                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-arch-charcoal/90 border border-arch-steel/50 backdrop-blur-sm">
                          <span className="text-arch-mist/70 text-xs font-mono tracking-wider uppercase">
                            Source Preview
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comparison Result */}
                  {selectedImage && enhancedImageUrl && (
                    <div className="w-full h-full p-6 flex flex-col animate-scale-in">
                      <div className="flex-grow">
                        <CompareSlider beforeImage={selectedImage.previewUrl} afterImage={enhancedImageUrl} />
                      </div>
                      <div className="mt-6 flex items-center justify-between">
                        <p className="text-arch-mist/40 text-xs font-mono">
                          Rendered at {new Date().toLocaleTimeString()}
                        </p>
                        <Button onClick={handleDownload}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Download Result
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 md:px-12 py-4 border-t border-arch-steel/20">
          <div className="flex items-center justify-between text-xs text-arch-mist/30 font-mono">
            <span>ArchiEnhance AI v2.0</span>
            <span className="hidden sm:inline">Professional Architectural Visualization</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
