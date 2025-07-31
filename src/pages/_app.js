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
      loadingComponent={
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          zIndex: 9999
        }}>
          🔄 Loading new version... Please wait
        </div>
      }
      onCacheClear={() => {
        console.log("🔁 Version mismatch detected. Cache cleared. Reloading...");
      }}
    >
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
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
