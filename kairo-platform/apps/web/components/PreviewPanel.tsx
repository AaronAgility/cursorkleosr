import { useState } from 'react';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const DEVICES = {
  desktop: { name: 'Desktop', width: '100%', height: '100%', icon: '🖥️' },
  tablet: { name: 'Tablet', width: '768px', height: '1024px', icon: '📱' },
  mobile: { name: 'Mobile', width: '375px', height: '667px', icon: '📱' },
};

export function PreviewPanel() {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop');
  const [currentUrl, setCurrentUrl] = useState('http://localhost:3000');
  const [inputUrl, setInputUrl] = useState('http://localhost:3000');
  const [isLoading, setIsLoading] = useState(false);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setCurrentUrl(inputUrl);
    // Simulate loading time
    setTimeout(() => setIsLoading(false), 800);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
  };

  const quickUrls = [
    { name: 'Project', url: 'http://localhost:3000' },
    { name: 'Docs', url: 'http://localhost:4001' },
    { name: 'Storybook', url: 'http://localhost:6006' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-medium text-gray-300">Live Preview</h2>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400 animate-pulse'}`}></div>
              <span className="text-xs text-gray-400">{isLoading ? 'Loading' : 'Live'}</span>
            </div>
          </div>

          {/* Device Selector */}
          <div className="flex items-center space-x-2">
            {Object.entries(DEVICES).map(([key, device]) => (
              <button
                key={key}
                onClick={() => setSelectedDevice(key as DeviceType)}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  selectedDevice === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={device.name}
              >
                {device.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Quick URL Buttons */}
        <div className="flex items-center space-x-2 mt-3">
          <span className="text-xs text-gray-400">Quick:</span>
          {quickUrls.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setInputUrl(item.url);
                setCurrentUrl(item.url);
                setIsLoading(true);
              }}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                currentUrl === item.url
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 bg-gray-900 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 relative"
          style={{
            width: DEVICES[selectedDevice].width,
            height: DEVICES[selectedDevice].height,
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          {/* Safari-style Browser Chrome */}
          <div className="bg-gray-200 px-3 py-2 flex items-center space-x-2 border-b">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            
            {/* Safari Address Bar */}
            <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center">
              <input
                type="url"
                value={inputUrl}
                onChange={handleUrlChange}
                className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-700 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter URL..."
              />
              <button
                type="submit"
                disabled={isLoading}
                className="ml-2 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {isLoading ? '⏳' : '→'}
              </button>
            </form>
          </div>

          {/* Preview Iframe/Content */}
          <div className="w-full h-full bg-white relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                <div className="text-center text-gray-600">
                  <div className="text-4xl mb-4 animate-spin">⏳</div>
                  <h3 className="text-lg font-medium mb-2">Loading...</h3>
                  <p className="text-sm text-gray-500">
                    Connecting to {currentUrl}
                  </p>
                </div>
              </div>
            )}
            
            <iframe 
              src={currentUrl} 
              className="w-full h-full border-0"
              title="Live Preview"
              onLoad={() => setIsLoading(false)}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          </div>
        </div>
      </div>

      {/* Preview Footer */}
      <div className="h-10 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-4 text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <span>Device: {DEVICES[selectedDevice].name}</span>
          <span>•</span>
          <span>Resolution: {DEVICES[selectedDevice].width} × {DEVICES[selectedDevice].height}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>URL: {currentUrl}</span>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Preview Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
} 