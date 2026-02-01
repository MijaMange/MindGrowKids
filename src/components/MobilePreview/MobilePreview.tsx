import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import './mobile-preview.css';

export function MobilePreview() {
  const [device, setDevice] = useState<'iphone' | 'android' | 'ipad'>('iphone');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const location = useLocation();
  const navigate = useNavigate();

  const deviceSizes = {
    iphone: { width: 390, height: 844, name: 'iPhone 14 Pro' },
    android: { width: 412, height: 915, name: 'Android' },
    ipad: { width: 820, height: 1180, name: 'iPad' },
  };

  const currentSize = deviceSizes[device];
  const width = orientation === 'landscape' ? currentSize.height : currentSize.width;
  const height = orientation === 'landscape' ? currentSize.width : currentSize.height;

  function toggleOrientation() {
    setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait');
  }

  const isNative = Capacitor.isNativePlatform();

  return (
    <div className="mobile-preview-container">
      <div className="mobile-preview-controls">
        <div className="device-selector">
          <label>
            Enhet:
            <select value={device} onChange={(e) => setDevice(e.target.value as any)}>
              <option value="iphone">iPhone</option>
              <option value="android">Android</option>
              <option value="ipad">iPad</option>
            </select>
          </label>
          <button onClick={toggleOrientation} className="orientation-btn">
            {orientation === 'portrait' ? '📱' : '📱↻'} {orientation === 'portrait' ? 'Stående' : 'Liggande'}
          </button>
        </div>
        <div className="preview-info">
          <span>{currentSize.name}</span>
          <span>{width} × {height}px</span>
          {isNative && <span className="native-badge">Native App</span>}
          <span className="route-info">{location.pathname}</span>
        </div>
        <button onClick={() => navigate('/dashboard')} className="close-btn">
          ✕ Stäng
        </button>
      </div>

      <div className="mobile-preview-wrapper">
        <div
          className={`mobile-device-frame ${device} ${orientation}`}
          style={{
            width: width + 40, // Extra space for frame
            height: height + 80, // Extra space for frame
          }}
        >
          <div className="device-screen" style={{ width, height }}>
            <div className="device-content">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

