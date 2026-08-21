import React from 'react';
import {
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {sourceCards} from './data';
import {C, Grain, Scene, clamp, easeOut, enter} from './common';

export const SourcesScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const titleP = enter(frame, fps, 0);
  return (
    <Scene duration={duration} background={C.green}>
      <Grain dark />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 70,
          textAlign: 'center',
          opacity: titleP,
          translate: `0px ${(1 - titleP) * 24}px`,
        }}
      >
        <div
          style={{
            color: C.lime,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 18,
            fontWeight: 820,
            letterSpacing: 3.5,
            textTransform: 'uppercase',
          }}
        >
          Trace every value
        </div>
        <div
          style={{
            marginTop: 12,
            color: '#FFFFFF',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 72,
            letterSpacing: -3.8,
            fontWeight: 900,
          }}
        >
          Original public sources
        </div>
      </div>
      {sourceCards.map((source, index) => {
        const p = enter(frame, fps, 10 + index * 6);
        return (
          <div
            key={source.country}
            style={{
              position: 'absolute',
              left: 120 + index * 580,
              top: 290,
              width: 520,
              height: 470,
              borderRadius: 38,
              background: '#FFFFFF',
              padding: '38px 38px',
              opacity: p,
              translate: `0px ${(1 - p) * 40}px`,
              scale: 0.95 + p * 0.05,
              boxShadow: '0 28px 80px rgba(0,0,0,.18)',
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <span style={{fontSize: 58}}>{source.flag}</span>
              <div
                style={{
                  borderRadius: 999,
                  padding: '10px 15px',
                  background: C.mist,
                  color: C.green,
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  fontSize: 15,
                  fontWeight: 820,
                  letterSpacing: 1.3,
                }}
              >
                OFFICIAL PRICE DATA
              </div>
            </div>
            <div
              style={{
                marginTop: 26,
                color: C.green,
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 62,
                fontWeight: 900,
                letterSpacing: -2.8,
              }}
            >
              {source.abbreviation}
            </div>
            <div
              style={{
                marginTop: 10,
                color: C.ink,
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 27,
                lineHeight: 1.15,
                fontWeight: 820,
                maxWidth: 430,
              }}
            >
              {source.fullName}
            </div>
            <div
              style={{
                position: 'absolute',
                left: 38,
                right: 38,
                bottom: 34,
                borderTop: `1px solid ${C.line}`,
                paddingTop: 20,
                color: C.muted,
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 18,
                lineHeight: 1.25,
                fontWeight: 700,
              }}
            >
              {source.dataset}
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 62,
          textAlign: 'center',
          color: 'rgba(255,255,255,.76)',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 18,
          fontWeight: 680,
          opacity: interpolate(frame, [45, 62], [0, 1], {...clamp, easing: easeOut}),
        }}
      >
        Attribution and reuse terms remain visible on the website.
      </div>
    </Scene>
  );
};
