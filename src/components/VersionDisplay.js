import { useEffect, useState } from 'react';

export default function VersionDisplay() {
  const [version, setVersion] = useState('Loading...');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    // Get version from localStorage or fetch from meta.json
    const storedVersion = localStorage.getItem('appVersion') || 'Unknown';
    setVersion(storedVersion);

    // Set last updated time
    setLastUpdated(new Date().toLocaleTimeString());
    
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(214, 31, 31, 0.8)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 1000,
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <div>Version: {version}</div>
      <div>Loaded: {lastUpdated}</div>
    </div>
  );
} 