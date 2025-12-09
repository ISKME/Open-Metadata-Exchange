// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';

const styles = `
.kaltura-player-shell { position: relative; width: 100%; aspect-ratio: 16/9; background:#000; }
.kaltura-player-shell > div { position:absolute; inset:0; }
`;

let kalturaScriptPromise: Promise<void> | null = null;

function useStableId(prefix = 'kaltura') {
  const maybeReactId = React && React.useId ? React.useId() : undefined;
  const ref = useRef(
    maybeReactId ||
      `${prefix}-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2)}`
  );
  return ref.current;
}

export function loadKalturaScript() {
  if (!kalturaScriptPromise) {
    kalturaScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://cdnapisec.kaltura.com/p/1821311/embedPlaykitJs/uiconf_id/54575792';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
  return kalturaScriptPromise;
}

export function primeKalturaConnections() {
  const add = (rel: string, href: string, crossorigin = true) => {
    if (document.head.querySelector(`link[rel='${rel}'][href='${href}']`))
      return;
    const l = document.createElement('link');
    l.rel = rel;
    l.href = href;
    if (crossorigin) l.crossOrigin = 'anonymous';
    document.head.appendChild(l);
  };
  add('preconnect', 'https://cdnapisec.kaltura.com');
  add('preconnect', 'https://cfvod.kaltura.com');
  add('dns-prefetch', '//cdnapisec.kaltura.com', false);
}

export function Player(props: {
  entryId?: string;
  time?: number | null;
  onLoad?: (data: any, player: any) => void;
  onPlay?: () => void;
  onFail?: (e?: any) => void;
}) {
  const containerId = useStableId('kaltura');

  const playerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!document.head.querySelector('style[data-kaltura-shell]')) {
      const s = document.createElement('style');
      s.setAttribute('data-kaltura-shell', '1');
      s.textContent = styles;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadKalturaScript()
      .then(() => {
        if (cancelled || playerRef.current) return;

        const p = KalturaPlayer.setup({
          targetId: containerId,
          provider: { partnerId: 1821311, uiConfId: 54575792 },
          playback: {
            autoplay: false,
            preload: 'auto',
            playsinline: true,
            bufferTarget: 30,
            preloadBufferLength: 5,
          },
        });

        p.addEventListener('play', () => props.onPlay?.());
        playerRef.current = p;
        setReady(true);
      })
      .catch((e) => props.onFail?.(e));

    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy?.();
      } catch {}
      playerRef.current = null;
    };
  }, [containerId]);

  useEffect(() => {
    if (!ready || !props.entryId) return;
    const p = playerRef.current;
    p.loadMedia({ entryId: props.entryId })
      .then((data: any) => props.onLoad?.(data, p))
      .catch((e: any) => props.onFail?.(e));
  }, [ready, props.entryId]);

  useEffect(() => {
    if (props.time == null) return;
    const p = playerRef.current;
    if (!p) return;
    p.currentTime = Number(props.time);
    p.play?.();
  }, [props.time]);

  return (
    <div className='kaltura-player-shell'>
      <div id={containerId} />
    </div>
  );
}

export default Player;
