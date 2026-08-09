"use client";

import React, { useEffect, useState } from "react";

interface BackendPreloaderProps {
  children: React.ReactNode;
}

export const BackendPreloader: React.FC<BackendPreloaderProps> = ({ children }) => {
  const [isBackendReady, setIsBackendReady] = useState<boolean>(false);
  const [showSlowWarning, setShowSlowWarning] = useState<boolean>(false);
  const [errorCount, setErrorCount] = useState<number>(0);

  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const baseUrl = rawApiUrl.replace(/\/api\/?$/, "");

  useEffect(() => {
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    // Show the "waking up" warning message if health check takes > 1.2 seconds
    timerId = setTimeout(() => {
      if (isMounted && !isBackendReady) {
        setShowSlowWarning(true);
      }
    }, 1200);

    const checkHealth = async () => {
      try {
        // Try /api/health first, then fallback to /health
        let response = await fetch(`${baseUrl}/api/health`, {
          method: "GET",
          headers: { "Cache-Control": "no-cache" },
        }).catch(() => null);

        if (!response || !response.ok) {
          response = await fetch(`${baseUrl}/health`, {
            method: "GET",
            headers: { "Cache-Control": "no-cache" },
          }).catch(() => null);
        }

        if (response && response.ok && isMounted) {
          setIsBackendReady(true);
        } else {
          throw new Error("Backend not ready");
        }
      } catch (err) {
        if (isMounted) {
          setErrorCount((prev) => prev + 1);
          // Retry polling every 2.5 seconds until instance boots up
          setTimeout(checkHealth, 2500);
        }
      }
    };

    checkHealth();

    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [baseUrl, isBackendReady]);

  // If backend is active and ready, instantly render the site
  if (isBackendReady) {
    return <>{children}</>;
  }

  // Otherwise, show the dark-mode loader
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#08090A] text-white p-6 font-sans">
      <div className="flex flex-col items-center max-w-md text-center space-y-6">
        {/* Glowing Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-ping" />
          <div className="w-16 h-16 rounded-full border-4 border-t-purple-500 border-r-cyan-400 border-b-purple-500/30 border-l-transparent animate-spin" />
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Connecting to <span className="text-purple-400">InterviewOS</span> API
          </h2>

          {showSlowWarning ? (
            <p className="text-amber-400 text-sm animate-pulse font-medium">
              ⚡ Waking up backend server... This may take a few moments on cold starts.
            </p>
          ) : (
            <p className="text-gray-400 text-sm">
              Verifying system status and initializing connection...
            </p>
          )}
        </div>

        {/* Retry Attempt Status Indicator */}
        {errorCount > 0 && (
          <div className="text-xs text-gray-500 bg-[#12141A] px-3 py-1.5 rounded-full border border-[#22252E]">
            Connection attempts: {errorCount} • Waiting for Render server response
          </div>
        )}
      </div>
    </div>
  );
};

export default BackendPreloader;
