import React from 'react';
import {
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {priceCards} from './data';
import {C, Grain, Scene, clamp, easeOut, enter} from './common';

const PriceCardView: React.FC<{index: number}> = ({index}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const card = priceCards[index];
  const p = enter(frame, fps, 5 + index * 4, 19);
  const col = index % 3;
  const row = Math.floor(index / 3);
  return (
    <div
      style={{
        position: 'absolute',
        left: 85 + col * 585,
        top: 240 + row * 315,
        width: 550,
        height: 282,
        borderRadius: 32,
        background: '#FFFFFF',
        border: `1px solid ${C.line}`,
        boxShadow: '0 22px 64px rgba(16,42,27,.10)',
        padding: '30px 32px',
        opacity: p,
        translate: `0px ${(1 - p) * 36}px`,
        scale: 0.96 + p * 0.04,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: -26,
          top: -42,
          width: 190,
          height: 190,
          borderRadius: '50%',
          background: card.accent,
          opacity: 0.42,
        }}
      />
      <Img
        src={staticFile(card.asset)}
        style={{
          position: 'absolute',
          right: 22,
          top: 16,
          width: 120,
          height: 120,
          objectFit: 'contain',
          filter: 'drop-shadow(0 16px 18px rgba(16,42,27,.12))',
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: C.green,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 18,
          fontWeight: 800,
        }}
      >
        <span style={{fontSize: 26}}>{card.flag}</span>
        <span>{card.product}</span>
        <span style={{opacity: 0.35}}>·</span>
        <span>{card.country}</span>
      </div>
      <div
        style={{
          marginTop: 25,
          color: C.ink,
          fontFamily: 'Arial, Helvetica, sans-serif',
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
        }}
      >
        <span style={{fontSize: 47, fontWeight: 900, letterSpacing: -2.2}}>{card.price}</span>
        <span style={{fontSize: 22, color: C.muted, fontWeight: 720}}>{card.unit}</span>
      </div>
      <div
        style={{
          marginTop: 23,
          color: C.green,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 16,
          lineHeight: 1.25,
          fontWeight: 800,
          maxWidth: 430,
        }}
      >
        {card.source}
      </div>
      <div
        style={{
          marginTop: 7,
          color: C.muted,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 14,
          fontWeight: 650,
        }}
      >
        {card.period}
      </div>
    </div>
  );
};

export const PricesScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = enter(frame, fps, 0);
  return (
    <Scene duration={duration} background={C.cream}>
      <Grain />
      <div style={{position: 'absolute', left: 85, top: 58, opacity: p, translate: `${(1 - p) * -28}px 0px`}}>
        <div
          style={{
            color: C.green,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 18,
            fontWeight: 820,
            textTransform: 'uppercase',
            letterSpacing: 3.6,
          }}
        >
          Real values from the website
        </div>
        <div
          style={{
            marginTop: 10,
            color: C.ink,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 70,
            lineHeight: 1,
            letterSpacing: -3.6,
            fontWeight: 900,
          }}
        >
          Latest published medians
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 90,
          top: 92,
          color: C.muted,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 18,
          fontWeight: 680,
          padding: '13px 20px',
          borderRadius: 999,
          background: '#FFFFFF',
          border: `1px solid ${C.line}`,
          opacity: interpolate(frame, [12, 28], [0, 1], {...clamp, easing: easeOut}),
        }}
      >
        Original currency · Original unit
      </div>
      {priceCards.map((card, index) => (
        <PriceCardView key={`${card.product}-${card.country}`} index={index} />
      ))}
      <div
        style={{
          position: 'absolute',
          left: 85,
          bottom: 42,
          color: C.muted,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 15,
          fontWeight: 650,
          opacity: interpolate(frame, [45, 65], [0, 1], {...clamp, easing: easeOut}),
        }}
      >
        Values shown exactly as published on Yugofarmia at capture time.
      </div>
    </Scene>
  );
};
