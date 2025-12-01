import { useState, useEffect } from 'react';

export type DeviceType = 'tv' | 'mobile' | 'tablet' | 'desktop';

export function useDeviceDetection(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent.toLowerCase();

      // Check for TV (large screens, 16:9 or 4:3 aspect ratio)
      const aspectRatio = width / height;
      const isLargeScreen = width >= 1200 && height >= 800;
      const isTVAspectRatio = (aspectRatio > 1.5 && aspectRatio < 2.5) || (aspectRatio > 1.2 && aspectRatio < 1.4);
      
      // TV detection
      if (isLargeScreen && isTVAspectRatio) {
        setDeviceType('tv');
        return;
      }

      // Mobile detection
      if (width < 768) {
        setDeviceType('mobile');
        return;
      }

      // Tablet detection
      if (width >= 768 && width < 1200) {
        setDeviceType('tablet');
        return;
      }

      setDeviceType('desktop');
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  return deviceType;
}
