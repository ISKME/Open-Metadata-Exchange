// @ts-nocheck
import { useEffect } from 'react';

const styles = `
.kaltura-player-container {
  height: 500px !important;
}
`;

let kalturaPlayerLoadPromise = null;
let player = null;
function loadKalturaPlayer() {
  if (!kalturaPlayerLoadPromise) {
    kalturaPlayerLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://cdnapisec.kaltura.com/p/1821311/embedPlaykitJs/uiconf_id/54575792';
      script.onload = (data) => {
        player = KalturaPlayer.setup({
          targetId: 'playerContainer',
          provider: {
            partnerId: 1821311,
            uiConfId: 54575792,
          }
        });
        resolve();
      };
      document.body.appendChild(script);
    });
  }
  return kalturaPlayerLoadPromise;
}

function Player(props) {
  useEffect(() => {
    const styleTag = document.createElement('style')
    styleTag.textContent = styles
    document.head.appendChild(styleTag)
  }, []);
  useEffect(() => {
    loadKalturaPlayer()
      .then(() => player.loadMedia({ entryId: props.entryId }))
      .then(props.onLoad)
      .catch(props.onFail)
  }, [props.entryId]);

  return <div id="playerContainer" />;
}

export { Player };
