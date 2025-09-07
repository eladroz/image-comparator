import { useState, useEffect } from "react";
import { ImageWithSizeOverlay } from "./components/ImageWithSizeOverlay";
import "./App.css";

function App() {
  const isDev = !!import.meta.env.DEV;
  
  const randomImageUrls = [
    "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?w=2400",
    "https://images.unsplash.com/photo-1608667508764-33cf0726b13a?w=2400",
    "https://images.unsplash.com/photo-1505022610485-0249ba5b3675?w=2400",
    "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=2400"
  ];
  
  // Helper function to get URL parameter
  const getUrlParameter = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('url');
  };
  
  // Helper function to update URL parameter without navigation
  const updateUrlParameter = (imageUrl) => {
    const url = new URL(window.location);
    if (imageUrl) {
      url.searchParams.set('url', imageUrl);
    } else {
      url.searchParams.delete('url');
    }
    window.history.replaceState({}, '', url);
  };
  
  const [inputUrl, setInputUrl] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState(() => {
    // Check for URL parameter first
    const urlParam = getUrlParameter();
    if (urlParam) {
      return urlParam;
    }
    // Fall back to random image
    const randomIndex = Math.floor(Math.random() * randomImageUrls.length);
    return randomImageUrls[randomIndex];
  });
  const [quality, setQuality] = useState(80);
  const [useAVIF, setUseAVIF] = useState(false);

  // Update URL parameter when currentImageUrl changes
  useEffect(() => {
    updateUrlParameter(currentImageUrl);
  }, [currentImageUrl]);

  const handleLoadImage = () => {
    if (inputUrl.trim()) {
      setCurrentImageUrl(inputUrl.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLoadImage();
    }
  };

  const proxiedImageUrl = `/api/image-proxy?url=${encodeURIComponent(currentImageUrl)}`;
  
  // Build Netlify Image CDN URL with dynamic parameters
  const netlifyImageCdnUrl = (() => {
    const baseUrl = `/.netlify/images?url=${encodeURIComponent(proxiedImageUrl)}`;
    const params = [];
    
    // Add quality parameter
    params.push(`q=${quality}`);
    
    // Add format parameter
    if (useAVIF) {
      params.push('fm=avif');
    } else if (isDev) {
      params.push('fm=webp');
    }
    
    return `${baseUrl}&${params.join('&')}`;
  })();

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="container mx-auto space-y-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body gap-3">
            <h2 className="card-title">Image size: original vs. Netlify Image CDN</h2>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/path/to/your-image.jpg"
                className="input input-bordered flex-1"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                className="btn btn-primary"
                onClick={handleLoadImage}
                disabled={!inputUrl.trim()}
              >
                Load
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Current image: <span className="font-mono text-xs">{currentImageUrl}</span>
            </p>            
            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text">Quality: {quality}</span>
              </label>
              <input 
                type="range" 
                min="50" 
                max="95" 
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="range range-primary" 
              />
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start">
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-primary" 
                  checked={useAVIF}
                  onChange={(e) => setUseAVIF(e.target.checked)}
                />
                <span className="label-text">Use AVIF format</span>
              </label>
            </div>
          </div>
        </div>

        <figure className="diff aspect-16/9" tabIndex={0}>
          <div className="diff-item-1" role="img" tabIndex={0}>
            <ImageWithSizeOverlay
              src={proxiedImageUrl}
              alt="Original image"
              overlayPosition="left"
            />
          </div>
          <div className="diff-item-2" role="img">
            <ImageWithSizeOverlay
              src={netlifyImageCdnUrl}
              alt="Netlify CDN processed image"
              overlayPosition="right"
            />
          </div>
          <div className="diff-resizer"></div>
        </figure>
      </div>
    </div>
  );
}

export default App;
