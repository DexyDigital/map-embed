import React from 'react';
import {
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {C, Grain, Scene, enter} from './common';

export const OutroScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = enter(frame, fps, 2, 20);
  const urlP = enter(frame, fps, 18, 20);
  return (
    <Scene duration={duration} background={C.paper} holdEnd>
      <Grain />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 128,
          textAlign: 'center',
          color: C.green,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 18,
          fontWeight: 820,
          letterSpacing: 4,
          textTransform: 'uppercase',
          opacity: p,
        }}
      >
        Explore prices · Products · Sources
      </div>
      <Img
        src={staticFile('live/yugofarmia-logo.png')}
        style={{
          position: 'absolute',
          left: 390,
          top: 285,
          width: 1140,
          height: 252,
          objectFit: 'contain',
          opacity: p,
          scale: 0.92 + p * 0.08,
          filter: 'drop-shadow(0 22px 28px rgba(29,81,47,.10))',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 650,
          textAlign: 'center',
          opacity: urlP,
          translate: `0px ${(1 - urlP) * 30}px`,
        }}
      >
        <div
          style={{
            color: C.muted,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 24,
            fontWeight: 720,
          }}
        >
          Visit
        </div>
        <div
          style={{
            marginTop: 14,
            color: C.green,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 76,
            lineHeight: 1,
            letterSpacing: -3.4,
            fontWeight: 900,
          }}
        >
          yugofarmia.com
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 500,
          right: 500,
          bottom: 96,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${C.green}, transparent)`,
          opacity: 0.28 * urlP,
        }}
      />
    </Scene>
  );
};
