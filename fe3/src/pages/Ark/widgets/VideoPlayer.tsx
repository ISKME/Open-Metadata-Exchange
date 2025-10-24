/* eslint-disable max-len */
// @ts-nocheck
import parse from 'html-react-parser';
import videojs from 'video.js';
import 'video.js/dist/video-js.min.css';
import 'videojs-hls-quality-selector';
import { useEffect, useRef } from 'react';

export const VideoPlayer = ({ video }) => {
    const videoRef = useRef(null)

    useEffect(() => {
      if (videoRef.current) {
        const videoTag = videoRef.current.getElementsByTagName('video')[0]

        if (videoTag) {
          const player = videojs(videoTag)
          player.hlsQualitySelector()
        }
      }
    })
  
    return <div ref={videoRef}>{ video }</div>;
  };

  export const makeVideoContent = (content: string) => {
    return parse(content, {
      transform(reactNode, domNode, index) {
        if (domNode?.name === 'video') {
          return <VideoPlayer video={reactNode} />
        }
        return reactNode
      },
    })
  };