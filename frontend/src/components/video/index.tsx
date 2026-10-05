import React, { useEffect, useRef, useState } from "react";

const styles = `
.oer-video-player-shell { position: relative; width: 100%; background:#000; }
.oer-video-player-shell.is-measuring { padding-top: 56.25%; }
.oer-video-player-shell iframe { position:absolute; top:0; left:0; width:100%; height:100%; border:0; }
`;

const MAX_ASPECT_RATIO = 16 / 9;

export function Player(props: {
  code?: string;
  time?: number | null;
  endTime?: number | null;
  onLoad?: (data: any, player: any) => void;
  onPlay?: () => void;
  onFail?: (e?: any) => void;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const segmentEndRef = useRef<number | null>(null);
  const [dims, setDims] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (!document.head.querySelector("style[data-oer-video-shell]")) {
      const s = document.createElement("style");
      s.setAttribute("data-oer-video-shell", "1");
      s.textContent = styles;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    setDims(null);
  }, [props.code]);

  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    const win = (e.target as HTMLIFrameElement).contentWindow as any;
    const p = win?.player;
    if (!p) {
      props.onFail?.(new Error("Video player failed to load"));
      return;
    }
    playerRef.current = p;

    const measure = () => {
      const el = win.document?.querySelector(".video-js");
      const containerWidth = shellRef.current?.clientWidth;
      if (!el || !containerWidth) return;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nativeRatio = rect.width / rect.height;
      const fullWidthHeight = containerWidth / nativeRatio;
      const maxHeight = containerWidth / MAX_ASPECT_RATIO;
      if (fullWidthHeight <= maxHeight) {
        setDims({ width: containerWidth, height: fullWidthHeight });
      } else {
        setDims({ width: maxHeight * nativeRatio, height: maxHeight });
      }
    };
    measure();
    p.on("playerresize", measure);
    win.addEventListener?.("resize", measure);

    p.on("play", () => props.onPlay?.());
    p.on("timeupdate", () => {
      const end = segmentEndRef.current;
      if (end == null) return;
      if (p.currentTime() >= end - 0.05) {
        p.pause();
        segmentEndRef.current = null;
      }
    });
    p.on("ended", () => {
      segmentEndRef.current = null;
    });

    const emitLoaded = () => {
      measure();
      props.onLoad?.({ sources: { duration: p.duration() } }, p);
    };
    if (p.readyState() > 0) emitLoaded();
    else p.one("loadedmetadata", emitLoaded);
  };

  useEffect(() => {
    if (props.time == null) return;
    const p = playerRef.current;
    if (!p) return;
    segmentEndRef.current = props.endTime == null ? null : Number(props.endTime);
    p.currentTime(Number(props.time));
    p.play();
  }, [props.time, props.endTime]);

  if (!props.code) return <div className="oer-video-player-shell is-measuring" />;

  return (
    <div
      ref={shellRef}
      className={`oer-video-player-shell${dims == null ? " is-measuring" : ""}`}
      style={dims == null ? undefined : { height: dims.height }}
    >
      <iframe
        key={props.code}
        title="Video player"
        src={`/video/${props.code}/embed`}
        allowFullScreen
        onLoad={handleIframeLoad}
        style={
          dims == null
            ? undefined
            : { width: dims.width, left: "50%", transform: "translateX(-50%)" }
        }
      />
    </div>
  );
}

export default Player;
