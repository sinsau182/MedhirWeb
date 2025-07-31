import CacheBuster from 'react-cache-buster';
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  updateSessionActivity,
  isSessionExpiredDueToInactivity,
  clearSession,
} from "@/utils/sessionManager";
import "../styles/globals.css";
import Layout from '../components/Layout';
import VersionDisplay from '../components/VersionDisplay';

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [version, setVersion] = useState(null);

  useEffect(() => {
    // Set app version in localStorage only in browser environment
    if (typeof window !== "undefined") {
      localStorage.setItem("appVersion", "1.0.0");
    }

    // Load version from public/meta.json at runtime
    fetch("/meta.json")
      .then((res) => res.json())
      .then((data) => {
        setVersion(data.version);
        // Add version to page title for easy identification
        if (typeof window !== "undefined") {
          localStorage.setItem("appVersion", data.version);
        }
      })
      .catch((err) => {
        console.error("Failed to load meta.json", err);
      });
  }, []);

  useEffect(() => {
    const activityEvents = ["mousemove", "keydown", "click", "scroll"];
    const handleActivity = () => updateSessionActivity();

    activityEvents.forEach((event) =>
      window.addEventListener(event, handleActivity)
    );

    const interval = setInterval(() => {
      if (isSessionExpiredDueToInactivity()) {
        clearSession();
        router.push("/login");
      }
    }, 60 * 1000);

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
      clearInterval(interval);
    };
  }, [router]);

  if (!version) return null; // or a loading spinner

  return (
    <CacheBuster
      currentVersion={version || "1.0.0"}
      isEnabled={process.env.NODE_ENV === "production"}
      loadingComponent={<div>Loading...</div>}
      onCacheClear={() => {
        console.log("🔁 Version mismatch detected. Cache cleared. Reloading...");
        console.log("📊 Cache buster stats:", {
          oldVersion: localStorage.getItem('appVersion'),
          newVersion: version,
          timestamp: new Date().toISOString()
        });
      }}
      onError={(error) => {
        console.error("Cache buster error:", error);
      }}
      onVersionCheck={(oldVersion, newVersion) => {
        console.log("🔍 CacheBuster version check:", { oldVersion, newVersion });
      }}
    >
              <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
            <VersionDisplay />
            {/* Test button for cache buster - remove in production */}
            {process.env.NODE_ENV === "development" && (
              <button
                onClick={() => {
                  localStorage.setItem('appVersion', '0.1.0'); // Set old version
                  window.location.reload(); // Force reload to trigger cache buster
                }}
                style={{
                  position: 'fixed',
                  bottom: '20px',
                  right: '20px',
                  zIndex: 9999,
                  padding: '10px',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Test Cache Buster
              </button>
            )}
            <Toaster
              position="top-right"
              richColors
              closeButton
              duration={4000}
            />
          </QueryClientProvider>
        </Provider>
    </CacheBuster>
  );
}

export default MyApp;
