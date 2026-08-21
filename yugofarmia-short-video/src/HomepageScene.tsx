import React from 'react';
import {
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {C, Grain, Scene, clamp, easeOut, enter} from './common';

const BrowserWindow: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = enter(frame, fps, 2);
  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        top: 95,
        width: 1680,
        height: 890,
        borderRadius: 34,
        background: '#FFFFFF',
        overflow: 'hidden',
        border: `1px solid ${C.line}`,
        boxShadow: '0 42px 120px rgba(16,42,27,.18)',
        opacity: p,
        scale: 0.94 + p * 0.06,
        translate: `0px ${(1 - p) * 45}px`,
      }}
    >
      <div
        style={{
          height: 58,
          background: '#F5F6F2',
          borderBottom: '1px solid #E8EAE5',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 12,
        }}
      >
        {['#F27667', '#F1C85B', '#77BD7F'].map((color) => (
          <div key={color} style={{width: 14, height: 14, borderRadius: 99, background: color}} />
        ))}
        <div
          style={{
            marginLeft: 22,
            height: 34,
            width: 420,
            borderRadius: 99,
            background: '#E9ECE6',
            color: '#5D6D62',
            display: 'flex',
            alignItems: 'center',
            padding: '0 22px',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 15,
          }}
        >
          yugofarmia.com
        </div>
      </div>
      <div style={{height: 832, overflow: 'hidden', background: '#FFFFFF'}}>
        <Img
          src={staticFile('live/homepage.png')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            scale: 1.005 + frame * 0.00017,
          }}
        />
      </div>
    </div>
  );
};

export const HomepageScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  return (
    <Scene duration={duration} background={C.cream}>
      <Grain />
      <BrowserWindow />
      <div
        style={{
          position: 'absolute',
          left: 145,
          bottom: 58,
          padding: '14px 22px',
          borderRadius: 999,
          color: C.green,
          background: 'rgba(255,255,255,.92)',
          boxShadow: '0 12px 34px rgba(16,42,27,.12)',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontWeight: 760,
          fontSize: 20,
          opacity: interpolate(frame, [28, 46], [0, 1], {...clamp, easing: easeOut}),
          translate: `${interpolate(frame, [28, 46], [-25, 0], {...clamp, easing: easeOut})}px 0px`,
        }}
      >
        Product · Country · Period · Source
      </div>
    </Scene>
  );
};
