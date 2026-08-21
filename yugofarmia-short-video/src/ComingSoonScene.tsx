import React from 'react';
import {
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {C, Grain, Scene, clamp, easeOut, enter} from './common';

export const ComingSoonScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = enter(frame, fps, 2);
  return (
    <Scene duration={duration} background={C.cream}>
      <Grain />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 120,
          display: 'flex',
          justifyContent: 'center',
          gap: 22,
          opacity: p,
        }}
      >
        {['🇭🇷', '🇷🇸', '🇸🇮'].map((flag) => (
          <div
            key={flag}
            style={{
              width: 112,
              height: 112,
              borderRadius: 32,
              display: 'grid',
              placeItems: 'center',
              background: '#FFFFFF',
              border: `1px solid ${C.line}`,
              boxShadow: '0 20px 46px rgba(16,42,27,.10)',
              fontSize: 58,
            }}
          >
            {flag}
          </div>
        ))}
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            style={{
              width: 112,
              height: 112,
              borderRadius: 32,
              display: 'grid',
              placeItems: 'center',
              border: '2px dashed rgba(29,81,47,.28)',
              color: C.green,
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontSize: 46,
              fontWeight: 760,
              opacity: interpolate(frame, [10 + item * 5, 25 + item * 5], [0, 1], {...clamp, easing: easeOut}),
            }}
          >
            +
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 160,
          right: 160,
          top: 390,
          textAlign: 'center',
          color: C.ink,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 92,
          lineHeight: 0.98,
          letterSpacing: -5.4,
          fontWeight: 900,
          opacity: p,
          translate: `0px ${(1 - p) * 44}px`,
        }}
      >
        More former Yugoslavian<br />
        <span style={{color: C.green}}>countries coming soon.</span>
      </div>
    </Scene>
  );
};
