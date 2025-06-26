'use client';

import { useState } from 'react';
import { Monitor, Tablet, Smartphone, ExternalLink, RotateCcw, ChevronDown } from 'lucide-react';

interface DeviceType {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  width: string;
  height: string;
}

const DEVICE_TYPES: DeviceType[] = [
  { name: 'Desktop', icon: Monitor, width: '100%', height: '100%' },
  { name: 'Tablet', icon: Tablet, width: '768px', height: '1024px' },
  { name: 'Mobile', icon: Smartphone, width: '375px', height: '667px' }
];

export function PreviewPanel() {
  const [currentUrl, setCurrentUrl] = useState('http://localhost:3000');
  const [inputUrl, setInputUrl] = useState('http://localhost:3000');
  const [deviceType, setDeviceType] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);

  const currentDevice = DEVICE_TYPES[deviceType] ?? DEVICE_TYPES[0]!;
  const DeviceIcon = currentDevice.icon;

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setCurrentUrl(inputUrl);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleQuickUrl = (url: string) => {
    setInputUrl(url);
    setCurrentUrl(url);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleDeviceSelect = (index: number) => {
    setDeviceType(index);
    setShowDeviceSelector(false);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-800 to-gray-900">
      {/* Browser Chrome */}
      <div className="bg-gray-700 border-b border-gray-600 p-3">
        {/* URL Bar */}
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          
          <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-gray-500"
                placeholder="Enter URL..."
              />
            </div>
            
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              Go →
            </button>
            
            <button
              type="button"
              onClick={handleRefresh}
              className="p-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500 hover:text-white transition-colors"
              title="Refresh"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500 hover:text-white transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </form>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 bg-gray-800 p-4 relative overflow-hidden">
        <div className="h-full flex items-center justify-center">
          <div 
            className="bg-white rounded-lg shadow-2xl border border-gray-600 relative transition-all duration-300 ease-in-out"
            style={{
              width: currentDevice.width,
              height: currentDevice.height,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Loading...</p>
                </div>
              </div>
            ) : (
              <iframe
                src={currentUrl}
                className="w-full h-full rounded-lg"
                title="Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                onLoad={() => setIsLoading(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Status Bar with Device Selector Dropdown */}
      <div className="bg-gray-700 border-t border-gray-600 px-4 py-2 flex items-center justify-between text-sm text-gray-300 relative">
        <div className="flex items-center space-x-4">
          {/* Device Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDeviceSelector(!showDeviceSelector)}
              className="flex items-center space-x-2 hover:text-white transition-colors cursor-pointer"
            >
              <span>Device:</span>
              <div className="flex items-center space-x-1">
                <DeviceIcon className="w-4 h-4" />
                <span className="font-medium">{currentDevice.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showDeviceSelector ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Dropdown Menu */}
            {showDeviceSelector && (
              <div className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded-lg shadow-xl border border-gray-600 py-2 min-w-[200px] z-50">
                {DEVICE_TYPES.map((device, index) => {
                  const DeviceIconComponent = device.icon;
                  return (
                    <button
                      key={device.name}
                      onClick={() => handleDeviceSelect(index)}
                      className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-700 transition-colors ${
                        deviceType === index ? 'bg-gray-700 text-white' : 'text-gray-300'
                      }`}
                    >
                      <DeviceIconComponent className="w-4 h-4" />
                      <div className="flex-1">
                        <div className="font-medium">{device.name}</div>
                        <div className="text-xs opacity-75">
                          {device.width} × {device.height}
                        </div>
                      </div>
                      {deviceType === index && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span>Resolution:</span>
            <span className="font-medium">
              {currentDevice.width === '100%' ? '100%' : currentDevice.width} × {currentDevice.height === '100%' ? '100%' : currentDevice.height}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>preview mode</span>
        </div>
      </div>
    </div>
  );
} 