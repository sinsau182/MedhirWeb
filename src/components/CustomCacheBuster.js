import { useEffect, useState } from 'react';

const CustomCacheBuster = ({ 
  currentVersion, 
  children, 
  onVersionMismatch,
  onError,
  isEnabled = true,
  loadingComponent = <div>Loading...</div>
}) => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasMismatch, setHasMismatch] = useState(false);

  useEffect(() => {
    if (!currentVersion || !isEnabled) {
      setIsChecking(false);
      return;
    }

    try {
      const storedVersion = localStorage.getItem('appVersion');
      console.log("🔍 CustomCacheBuster version check:", {
        storedVersion,
        currentVersion,
        isMismatch: storedVersion && storedVersion !== currentVersion
      });

      if (storedVersion && storedVersion !== currentVersion) {
        console.log("🔁 CustomCacheBuster version mismatch detected!");
        console.log("📊 CustomCacheBuster stats:", {
          oldVersion: storedVersion,
          newVersion: currentVersion,
          timestamp: new Date().toISOString()
        });
        
        setHasMismatch(true);
        
        // Call the callback if provided
        if (onVersionMismatch) {
          onVersionMismatch(storedVersion, currentVersion);
        }
        
        // Update localStorage and reload
        console.log("🔄 Updating localStorage and reloading...");
        localStorage.setItem('appVersion', currentVersion);
        window.location.reload();
      } else {
        // Set initial version if not exists
        if (!storedVersion) {
          console.log("📝 Setting initial version:", currentVersion);
        } else {
          console.log("✅ Versions match, no action needed");
        }
        localStorage.setItem('appVersion', currentVersion);
        setIsChecking(false);
      }
    } catch (error) {
      console.error("CustomCacheBuster error:", error);
      if (onError) {
        onError(error);
      }
      setIsChecking(false);
    }
  }, [currentVersion, onVersionMismatch, onError]);

  if (isChecking || hasMismatch) {
    return loadingComponent;
  }

  return children;
};

export default CustomCacheBuster; 