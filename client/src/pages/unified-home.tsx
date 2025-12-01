import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import TVHome from "./tv-home";
import Home from "./home";
import Login from "./login";

/**
 * Unified home page that adapts to different device types
 * - TV: Shows TV optimized interface with D-pad navigation
 * - Mobile: Shows touch-friendly interface
 * - Desktop: Shows full web interface
 */
export default function UnifiedHome() {
  const deviceType = useDeviceDetection();

  // Check if user is authenticated
  const token = localStorage.getItem("appToken");
  const user = localStorage.getItem("user") || localStorage.getItem("appUser");
  
  // If NOT authenticated, show login page
  if (!token || !user) {
    return <Login />;
  }

  // Render appropriate interface based on device type
  if (deviceType === 'tv') {
    return <TVHome />;
  }

  return <Home />;
}
