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
// import VersionDisplay from '../components/VersionDisplay';
import CustomCacheBuster from '../components/CustomCacheBuster';
import CacheBusterLoading from '../components/CacheBusterLoading';
import { AuthProvider } from '@/components/providers/AuthProvider';

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [version, setVersion] = useState(null);

  useEffect(() => {
    // Load version from public/meta.json at runtime
    fetch("/meta.json")
      .then((res) => res.json())
      .then((data) => {
        console.log("📦 Fetched version from meta.json:", data.version);
        setVersion(data.version);
        // Add version to page title for easy identification
        if (typeof window !== "undefined") {
          document.title = `Nayati UI v${data.version}`;
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
    <CustomCacheBuster
      currentVersion={version || "1.0.0"}
      isEnabled={process.env.NODE_ENV === "production"}
      loadingComponent={<CacheBusterLoading />}
      onVersionMismatch={(oldVersion, newVersion) => {
        console.log("🔁 CustomCacheBuster version mismatch detected!");
        console.log("📊 CustomCacheBuster stats:", {
          oldVersion,
          newVersion,
          timestamp: new Date().toISOString()
        });
      }}
      onError={(error) => {
        console.error("CustomCacheBuster error:", error);
      }}
    >
              <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider> {/* ✅ Wrap everything with AuthProvider */}
            <Layout>
              <Component {...pageProps} />
            </Layout>
            {/* <VersionDisplay /> */}
            {/* Test buttons - only in development */}
            {/* {process.env.NODE_ENV === "development" && (
              <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
                <button
                  onClick={() => {
                    console.log("🔴 Test CustomCacheBuster - Clear localStorage");
                    localStorage.removeItem('appVersion');
                    console.log("🗑️ Cleared localStorage.appVersion");
                    console.log("🔄 Reloading page...");
                    window.location.reload();
                  }}
                  style={{
                    padding: '10px',
                    backgroundColor: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginBottom: '10px',
                    display: 'block'
                  }}
                >
                  Test CustomCacheBuster
                </button>
                <button
                  onClick={() => {
                    console.log("🔍 CustomCacheBuster Debug State:", {
                      localStorage: localStorage.getItem('appVersion'),
                      version: version,
                      NODE_ENV: process.env.NODE_ENV
                    });
                    console.log("📋 All localStorage keys:", Object.keys(localStorage));
                  }}
                  style={{
                    padding: '10px',
                    backgroundColor: '#4444ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    display: 'block',
                    marginBottom: '10px',
                    display: 'block'
                  }}
                >
                  Debug State
                </button>
                <button
                  onClick={() => {
                    // Force a version mismatch by setting an old version
                    localStorage.setItem('appVersion', '0.1.0');
                    console.log("🔧 Force version mismatch: set appVersion to 0.1.0");
                    console.log("🔄 Reloading to trigger CustomCacheBuster...");
                    window.location.reload();
                  }}
                  style={{
                    padding: '10px',
                    backgroundColor: '#44ff44',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    display: 'block'
                  }}
                >
                  Force Version Mismatch
                </button>
              </div>
            )} */}
            <Toaster
              position="top-right"
              richColors
              closeButton
              duration={4000}
            />
            </AuthProvider>
          </QueryClientProvider>
        </Provider>
    </CustomCacheBuster>
  );
}

export default MyApp;
