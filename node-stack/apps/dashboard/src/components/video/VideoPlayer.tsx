import { useRef, forwardRef } from "react";
import { Plyr, APITypes, PlyrProps } from "plyr-react";
import "plyr-react/plyr.css";
import classNames from "classnames";

interface VideoPlayerProps {
  source: PlyrProps["source"];
  options?: PlyrProps["options"];
  className?: string;
  poster?: string;
}

const VideoPlayer = forwardRef<APITypes, VideoPlayerProps>(
  ({ source, options, className, poster }, ref) => {
    const playerRef = useRef<APITypes>(null);

    const defaultOptions: PlyrProps["options"] = {
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "captions",
        "settings",
        "fullscreen",
      ],
      settings: ["captions", "quality", "speed"],
      ...options,
    };

    const finalSource = {
      ...source,
      type: source?.type || "video",
      poster: poster || source?.poster,
    } as PlyrProps["source"];

    return (
      <div
        className={classNames(
          "azteli-player-wrapper rounded-xl overflow-hidden shadow-lg",
          className
        )}
      >
        <Plyr
          ref={ref || playerRef}
          source={finalSource}
          options={defaultOptions}
        />
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
