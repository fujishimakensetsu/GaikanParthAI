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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setEnhancedImageUrl(null);
    setError(null);

    // Basic validation
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract base64 data and mime type
      // result format: "data:image/png;base64,iVBORw0K..."
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
      setError(err.message || "An unexpected error occurred while enhancing the image.");
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
    link.download = `enhanced_render_${timeOfDay}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ArchiEnhance AI
            </h1>
            <p className="text-slate-400 mt-2">
              Professional architectural render enhancement powered by Gemini 2.5 Flash.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Powered by Google Gemini
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Controls & Input */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Upload Area */}
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-4 text-slate-200">1. Upload Render</h2>
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  selectedImage ? 'border-green-500/50 bg-green-500/5' : 'border-slate-600 hover:border-blue-500 hover:bg-slate-800'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {selectedImage ? (
                  <div className="space-y-2">
                    <div className="mx-auto w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="text-sm font-medium truncate max-w-[200px] mx-auto">{selectedImage.file.name}</p>
                    <p className="text-xs text-slate-400">Click to change</p>
                  </div>
                ) : (
                  <div className="space-y-2 cursor-pointer">
                    <div className="mx-auto w-12 h-12 bg-slate-700 text-slate-400 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <p className="text-sm font-medium">Upload an image</p>
                    <p className="text-xs text-slate-400">JPG, PNG supported</p>
                  </div>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-4 text-slate-200">2. Adjustments</h2>
              <div className="space-y-6">
                
                {/* Time of Day Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-3">Time of Day (時間帯)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTimeOfDay('day')}
                      disabled={loading}
                      className={`relative p-4 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2 group ${
                        timeOfDay === 'day' 
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                      }`}
                    >
                      {timeOfDay === 'day' && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500"></div>
                      )}
                      <svg className={`w-8 h-8 ${timeOfDay === 'day' ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="font-medium text-sm">Daytime (昼)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTimeOfDay('night')}
                      disabled={loading}
                      className={`relative p-4 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2 group ${
                        timeOfDay === 'night' 
                          ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.1)]' 
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                      }`}
                    >
                      {timeOfDay === 'night' && (
                         <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500"></div>
                      )}
                      <svg className={`w-8 h-8 ${timeOfDay === 'night' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <span className="font-medium text-sm">Nighttime (夜)</span>
                    </button>
                  </div>
                </div>

                {/* Background Toggle */}
                <div>
                  <label 
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                      addBackground 
                        ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                        : 'bg-slate-900 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className={`relative w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                      addBackground ? 'bg-blue-500 border-blue-500' : 'border-slate-500'
                    }`}>
                      {addBackground && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <div>
                      <span className={`block font-medium text-sm ${addBackground ? 'text-blue-200' : 'text-slate-300'}`}>
                        Auto-fill Background (背景自動挿入)
                      </span>
                      <span className="block text-xs text-slate-500 mt-0.5">
                        Fills white areas with matching scenery
                      </span>
                    </div>
                  </label>
                </div>

                {/* Custom Prompt */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Additional Instructions (Optional)</label>
                  <textarea 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-24 placeholder-slate-600"
                    placeholder="e.g., Add a vintage filter, remove the person in the background..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    disabled={loading || !selectedImage}
                  />
                </div>
                
                <Button 
                  onClick={handleEnhance} 
                  disabled={!selectedImage || loading}
                  isLoading={loading}
                  className="w-full"
                >
                  {loading ? 'Processing...' : 'Enhance Graphic'}
                </Button>

                {enhancedImageUrl && (
                  <Button variant="secondary" onClick={handleReset} className="w-full">
                    Start Over
                  </Button>
                )}
              </div>
            </div>
            
            {/* Guidelines Info */}
            <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-800/50 text-sm text-blue-200">
              <p className="font-semibold mb-2">Processing Logic:</p>
              <ul className="list-disc pl-4 space-y-1 text-blue-300/80">
                <li>Analyzes image structure.</li>
                <li>Applies <strong>{timeOfDay === 'day' ? 'Daytime' : 'Nighttime'}</strong> lighting settings.</li>
                {addBackground && (
                   <li><strong>Auto-fills</strong> white backgrounds with scenery.</li>
                )}
                <li>Enhances global illumination & textures.</li>
                <li>Preserves original color palette.</li>
              </ul>
            </div>
          </div>

          {/* Right Panel: Preview & Results */}
          <div className="lg:col-span-8 min-h-[500px]">
             {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-xl flex items-start gap-3">
                 <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 <div>
                   <p className="font-semibold">Processing Error</p>
                   <p className="text-sm opacity-80">{error}</p>
                 </div>
              </div>
            )}

            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden h-full min-h-[600px] relative flex items-center justify-center">
              
              {/* Empty State */}
              {!selectedImage && !loading && (
                <div className="text-center text-slate-500 p-8">
                  <div className="w-24 h-24 bg-slate-700/50 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-10 h-10 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className="text-xl font-medium text-slate-300 mb-2">Ready to Visualize</h3>
                  <p className="max-w-sm mx-auto">Upload your architectural sketch or render to see the AI enhancement magic happen.</p>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="absolute inset-0 z-20 bg-slate-900/90 flex items-center justify-center backdrop-blur-sm">
                  <Spinner />
                </div>
              )}

              {/* Before only (Initial Upload) */}
              {selectedImage && !enhancedImageUrl && !loading && (
                <div className="relative w-full h-full p-4">
                  <img 
                    src={selectedImage.previewUrl} 
                    alt="Original" 
                    className="w-full h-full object-contain rounded-lg" 
                  />
                  <div className="absolute top-6 left-6 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-md">Original Preview</div>
                </div>
              )}

              {/* Comparison Result */}
              {selectedImage && enhancedImageUrl && (
                <div className="w-full h-full p-4 flex flex-col">
                  <div className="flex-grow relative">
                     <CompareSlider 
                      beforeImage={selectedImage.previewUrl}
                      afterImage={enhancedImageUrl}
                     />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="primary" onClick={handleDownload}>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Download Result
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;