import { useState, useEffect } from "react";

interface UseVideoDurationProps {
  url?: string;
  provider?: string;
  duration?: string;
}

// Global cache to store video durations by URL to avoid re-fetching
const durationCache = new Map<string, string>();

export const useVideoDuration = ({
  url,
  provider,
  duration: initialDuration,
}: UseVideoDurationProps) => {
  // Initialize state from cache if available to prevent flash of empty content
  const [duration, setDuration] = useState<string>(() => {
    if (initialDuration) return initialDuration;
    if (url && durationCache.has(url)) return durationCache.get(url)!;
    return "";
  });

  useEffect(() => {
    // 1. Prefer explicit duration
    if (initialDuration) {
      setDuration(initialDuration);
      return undefined;
    }

    // 2. Validate URL
    if (!url) {
      setDuration("");
      return undefined;
    }

    // 3. Check Cache
    if (durationCache.has(url)) {
      setDuration(durationCache.get(url)!);
      return undefined;
    }

    // 4. Fetch Metadata (HTML5)
    if (!provider || provider === "html5") {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.crossOrigin = "anonymous"; // Enable CORS for metadata

      const onLoadedMetadata = () => {
        const totalSeconds = video.duration;
        if (
          !isNaN(totalSeconds) &&
          isFinite(totalSeconds) &&
          totalSeconds > 0
        ) {
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = Math.floor(totalSeconds % 60);
          const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

          // Update cache and local state
          durationCache.set(url, formatted);
          setDuration(formatted);
        }
      };

      // Attach listener BEFORE setting src and loading
      video.addEventListener("loadedmetadata", onLoadedMetadata);
      video.src = url;
      video.load();

      // Check if metadata loaded synchronously or from browser cache
      if (video.readyState >= 1) {
        onLoadedMetadata();
      }

      // Cleanup
      return () => {
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
        video.removeAttribute("src");
        video.load();
      };
    }

    // 5. Fallback
    setDuration("");
    return undefined;
  }, [url, provider, initialDuration]);

  return duration;
};
