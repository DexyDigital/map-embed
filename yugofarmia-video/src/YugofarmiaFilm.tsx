import React from 'react';
import {Audio} from '@remotion/media';
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export type YugofarmiaFilmProps = {
  soundtrackVolume: number;
  showUrl: boolean;
};

const C = {
  ink: '#111411',
  cream: '#F4F0E6',
  paper: '#FBFAF5',
  green: '#1D512F',
  green2: '#27613A',
  mist: '#E7EFE7',
  lime: '#C9FF63',
  coral: '#F36F45',
  lilac: '#C990E3',
  blue: '#4C67E8',
  yellow: '#F1C95B',
};

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const fade = (frame: number, duration: number, fadeFrames = 12) =>
  interpolate(frame, [0, fadeFrames, duration - fadeFrames, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: [ease, Easing.linear, Easing.bezier(0.7, 0, 0.84, 0)],
  });

const rise = (frame: number, fps: number, delay = 0) =>
  spring({fps, frame: Math.max(0, frame - delay), config: {damping: 18, stiffness: 105, mass: 0.75}});

const Grain: React.FC<{dark?: boolean}> = ({dark = false}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      opacity: dark ? 0.22 : 0.16,
      mixBlendMode: dark ? 'screen' : 'multiply',
      backgroundImage:
        'radial-gradient(circle at 20% 20%, rgba(255,255,255,.35) 0 1px, transparent 1.2px), radial-gradient(circle at 80% 70%, rgba(0,0,0,.28) 0 1px, transparent 1.2px)',
      backgroundSize: '13px 13px, 17px 17px',
    }}
  />
);

const Brand: React.FC<{dark?: boolean; compact?: boolean}> = ({dark = false, compact = false}) => {
  const color = dark ? '#FFFFFF' : C.green;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: compact ? 16 : 24}}>
      <svg width={compact ? 58 : 88} height={compact ? 58 : 88} viewBox="0 0 88 88" fill="none">
        <path d="M10 55C24 38 45 31 73 33C60 52 38 63 10 55Z" fill={color} />
        <path d="M17 42C31 25 48 18 68 20C56 35 40 44 17 42Z" fill={color} opacity="0.84" />
        <path d="M44 10L48 20L59 21L51 28L54 39L44 33L34 39L37 28L29 21L40 20L44 10Z" fill={color} />
        <path d="M14 58C33 59 50 52 70 36" stroke={dark ? C.lime : C.cream} strokeWidth="3" strokeLinecap="round" />
      </svg>
      <div>
        <div
          style={{
            fontFamily: 'Arial, Helvetica, sans-serif',
            color,
            fontWeight: 900,
            fontSize: compact ? 34 : 56,
            lineHeight: 0.94,
            letterSpacing: -2,
          }}
        >
          YUGOFARMIA
        </div>
        {!compact ? (
          <div
            style={{
              marginTop: 10,
              color,
              opacity: 0.72,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 8,
              textTransform: 'uppercase',
            }}
          >
            MARKETPLACE
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Scene: React.FC<{
  duration: number;
  children: React.ReactNode;
  background?: string;
  noFadeOut?: boolean;
}> = ({duration, children, background = C.cream, noFadeOut = false}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background,
        overflow: 'hidden',
        opacity: noFadeOut
          ? interpolate(frame, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease})
          : fade(frame, duration),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const FloatingDot: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  phase: number;
}> = ({x, y, size, color, phase}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size * 0.34,
        background: color,
        boxShadow: '0 18px 45px rgba(17,20,17,.13)',
        translate: `0px ${Math.sin((frame + phase) / 18) * 14}px`,
        rotate: `${Math.sin((frame + phase) / 24) * 8}deg`,
      }}
    />
  );
};

const BrowserFrame: React.FC<{
  src: string;
  label?: string;
  scale?: number;
  objectPosition?: string;
}> = ({src, label = 'yugofarmia.com', scale = 1, objectPosition = 'center center'}) => (
  <div
    style={{
      width: 1390,
      height: 870,
      borderRadius: 34,
      background: '#FFFFFF',
      boxShadow: '0 34px 110px rgba(17,20,17,.18)',
      border: '1px solid rgba(29,81,47,.13)',
      overflow: 'hidden',
      scale,
    }}
  >
    <div
      style={{
        height: 58,
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '0 22px',
        borderBottom: '1px solid #E7E9E4',
        background: '#FAFAF7',
      }}
    >
      {[C.coral, C.yellow, '#7DC48E'].map((color) => (
        <span key={color} style={{width: 13, height: 13, borderRadius: 99, background: color}} />
      ))}
      <div
        style={{
          marginLeft: 20,
          padding: '10px 22px',
          background: '#EFF2EC',
          borderRadius: 999,
          fontSize: 15,
          color: '#526056',
          minWidth: 360,
        }}
      >
        {label}
      </div>
    </div>
    <div style={{height: 812, overflow: 'hidden', background: '#FFFFFF'}}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition,
        }}
      />
    </div>
  </div>
);

const Opening: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = rise(frame, fps, 6);
  return (
    <Scene duration={duration} background={C.cream}>
      <Grain />
      <div
        style={{
          position: 'absolute',
          right: -170,
          top: -35,
          rotate: '-3deg',
          scale: 1.02 + p * 0.015,
          opacity: 0.96,
        }}
      >
        <BrowserFrame src="capture/10-products.png" scale={0.79} />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(244,240,230,1) 0%, rgba(244,240,230,.98) 36%, rgba(244,240,230,.24) 70%, rgba(244,240,230,0) 100%)',
        }}
      />
      <div style={{position: 'absolute', left: 105, top: 84, opacity: p, translate: `${(1 - p) * -35}px 0px`}}>
        <Brand compact />
      </div>
      <div style={{position: 'absolute', left: 108, top: 300, width: 800}}>
        <div
          style={{
            fontFamily: 'Georgia, Times New Roman, serif',
            fontSize: 42,
            color: C.green,
            marginBottom: 24,
            opacity: p,
          }}
        >
          Across our region,
        </div>
        <div
          style={{
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 104,
            fontWeight: 900,
            letterSpacing: -6,
            lineHeight: 0.95,
            color: C.ink,
            opacity: p,
            translate: `0px ${(1 - p) * 45}px`,
          }}
        >
          What is the<br />
          <span style={{color: C.green}}>right price</span> today?
        </div>
        <div
          style={{
            marginTop: 45,
            display: 'inline-flex',
            gap: 16,
            alignItems: 'center',
            padding: '15px 22px',
            borderRadius: 999,
            background: 'rgba(255,255,255,.68)',
            color: C.green,
            fontWeight: 750,
            fontSize: 20,
            opacity: interpolate(frame, [20, 42], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease}),
          }}
        >
          Croatia <span style={{opacity: 0.3}}>•</span> Serbia <span style={{opacity: 0.3}}>•</span> Slovenia
        </div>
      </div>
      <FloatingDot x={1520} y={110} size={76} color={C.lime} phase={0} />
      <FloatingDot x={1690} y={320} size={62} color={C.lilac} phase={20} />
      <FloatingDot x={1450} y={770} size={74} color={C.coral} phase={40} />
    </Scene>
  );
};

const Network: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const centerX = 960;
  const centerY = 570;
  const nodes = [
    {label: 'Croatia', x: 590, y: 420, color: C.coral, sub: 'DZS'},
    {label: 'Serbia', x: 1320, y: 420, color: C.lilac, sub: 'SORS'},
    {label: 'Slovenia', x: 960, y: 805, color: C.blue, sub: 'SURS'},
    {label: 'Products', x: 960, y: 270, color: C.lime, sub: '137'},
  ];
  const progress = rise(frame, fps, 3);
  return (
    <Scene duration={duration} background={C.ink}>
      <Grain dark />
      {[170, 300, 430].map((r) => (
        <div
          key={r}
          style={{
            position: 'absolute',
            left: centerX - r,
            top: centerY - r,
            width: r * 2,
            height: r * 2,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,.18)',
            opacity: 0.35 + progress * 0.5,
            scale: 0.94 + progress * 0.06,
          }}
        />
      ))}
      <div style={{position: 'absolute', left: 54, top: 42, color: '#FFFFFF', fontSize: 24, fontWeight: 800}}>
        Your market · 3 countries
      </div>
      <div
        style={{
          position: 'absolute',
          right: 52,
          top: 34,
          border: '1px solid rgba(255,255,255,.45)',
          borderRadius: 999,
          color: '#FFFFFF',
          padding: '12px 20px',
          fontSize: 16,
        }}
      >
        + Connect source
      </div>
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        {nodes.map((n, index) => (
          <line
            key={n.label}
            x1={centerX}
            y1={centerY}
            x2={centerX + (n.x - centerX) * progress}
            y2={centerY + (n.y - centerY) * progress}
            stroke="rgba(255,255,255,.42)"
            strokeWidth="2"
            strokeDasharray="5 8"
            strokeDashoffset={-frame * (0.7 + index * 0.13)}
          />
        ))}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: centerX - 62,
          top: centerY - 62,
          width: 124,
          height: 124,
          borderRadius: 30,
          background: '#FFFFFF',
          display: 'grid',
          placeItems: 'center',
          boxShadow: `0 0 0 ${14 + Math.sin(frame / 7) * 3}px rgba(201,255,99,.22)`,
          scale: 0.8 + progress * 0.2,
        }}
      >
        <svg width="68" height="68" viewBox="0 0 88 88" fill="none">
          <path d="M10 55C24 38 45 31 73 33C60 52 38 63 10 55Z" fill={C.green} />
          <path d="M17 42C31 25 48 18 68 20C56 35 40 44 17 42Z" fill={C.green2} />
          <path d="M44 10L48 20L59 21L51 28L54 39L44 33L34 39L37 28L29 21L40 20L44 10Z" fill={C.green} />
        </svg>
      </div>
      {nodes.map((n, index) => {
        const np = rise(frame, fps, 9 + index * 4);
        return (
          <div
            key={n.label}
            style={{
              position: 'absolute',
              left: n.x - 66,
              top: n.y - 66,
              width: 132,
              textAlign: 'center',
              opacity: np,
              scale: 0.75 + np * 0.25,
            }}
          >
            <div
              style={{
                margin: '0 auto 12px',
                width: 76,
                height: 76,
                borderRadius: 22,
                background: n.color,
                border: '6px solid #FFFFFF',
                boxShadow: `0 0 0 7px ${n.color}55`,
                display: 'grid',
                placeItems: 'center',
                color: C.ink,
                fontWeight: 900,
                fontSize: 20,
              }}
            >
              {n.sub}
            </div>
            <div style={{color: '#FFFFFF', fontSize: 18, fontWeight: 750}}>{n.label}</div>
          </div>
        );
      })}
    </Scene>
  );
};

const LogoCard: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = rise(frame, fps, 2);
  return (
    <Scene duration={duration} background={C.paper}>
      <Grain />
      <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: p, scale: 0.88 + p * 0.12}}>
        <Brand />
      </div>
    </Scene>
  );
};

const Conversation: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const first = rise(frame, fps, 3);
  const second = rise(frame, fps, 34);
  return (
    <Scene duration={duration} background="#F7F7F5">
      <div style={{position: 'absolute', left: 470, top: 340, width: 980}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, opacity: first, translate: `${(1 - first) * -35}px 0px`}}>
          <div style={{width: 66, height: 66, borderRadius: 18, background: C.lime, display: 'grid', placeItems: 'center'}}>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 9px)', gap: 7}}>
              {[0, 1, 2, 3].map((i) => <span key={i} style={{width: 9, height: 9, borderRadius: 2, background: C.ink}} />)}
            </div>
          </div>
          <div style={{fontFamily: 'Georgia, Times New Roman, serif', fontSize: 43, color: C.ink}}>
            Let’s find the right agricultural price.
          </div>
        </div>
        <div
          style={{
            marginTop: 78,
            marginLeft: 300,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 18,
            padding: '22px 30px',
            borderRadius: 28,
            background: '#FFFFFF',
            boxShadow: '0 18px 52px rgba(17,20,17,.12)',
            fontSize: 29,
            fontWeight: 720,
            color: C.green,
            opacity: second,
            translate: `${(1 - second) * 35}px 0px`,
          }}
        >
          <span style={{fontSize: 34}}>🥔</span>
          Potatoes · Serbia · latest available
        </div>
        <div
          style={{
            marginTop: 32,
            marginLeft: 705,
            color: '#67726A',
            fontSize: 18,
            opacity: interpolate(frame, [52, 68], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          Start search →
        </div>
      </div>
    </Scene>
  );
};

const Analyzer: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const orbit = [
    {r: 170, color: C.lime, phase: 0},
    {r: 270, color: C.coral, phase: 2.1},
    {r: 370, color: C.lilac, phase: 4.2},
    {r: 450, color: C.blue, phase: 5.4},
  ];
  return (
    <Scene duration={duration} background={C.ink}>
      <Grain dark />
      <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}>
        <div style={{fontFamily: 'Georgia, Times New Roman, serif', color: '#FFFFFF', fontSize: 42, letterSpacing: -1}}>
          Checking <span style={{display: 'inline-block', margin: '0 18px', width: 30, height: 30, border: '4px dotted #FFFFFF', borderRadius: '50%', rotate: `${frame * 9}deg`}} /> official sources
        </div>
      </div>
      {orbit.map((o, i) => {
        const angle = frame / (11 + i * 2) + o.phase;
        return (
          <div
            key={o.r}
            style={{
              position: 'absolute',
              left: 960 + Math.cos(angle) * o.r - 8,
              top: 540 + Math.sin(angle) * o.r * 0.48 - 8,
              width: 16 + i * 2,
              height: 16 + i * 2,
              borderRadius: 99,
              background: o.color,
              boxShadow: `0 0 24px ${o.color}`,
            }}
          />
        );
      })}
      <div style={{position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,.55)', fontSize: 17, letterSpacing: 4}}>
        DZS · SORS · SURS
      </div>
    </Scene>
  );
};

const CapturedStep: React.FC<{src: string; from: number; duration: number}> = ({src, from, duration}) => {
  const frame = useCurrentFrame();
  const local = frame - from;
  const opacity = interpolate(local, [0, 8, duration - 8, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: [ease, Easing.linear, ease],
  });
  return (
    <AbsoluteFill style={{opacity}}>
      <BrowserFrame src={`capture/${src}`} />
    </AbsoluteFill>
  );
};

const Walkthrough: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const steps = [
    {src: '01-prices-initial.png', from: 0, duration: 33},
    {src: '02-product-open.png', from: 25, duration: 34},
    {src: '03-product-selected.png', from: 51, duration: 32},
    {src: '04-country-open.png', from: 75, duration: 34},
    {src: '05-country-selected.png', from: 101, duration: 30},
    {src: '06-period-open.png', from: 123, duration: 32},
    {src: '07-ready-to-search.png', from: 147, duration: 42},
  ];
  const cursorPoints = [
    [460, 735],
    [520, 670],
    [690, 735],
    [690, 670],
    [920, 735],
    [920, 670],
    [1160, 735],
  ];
  const segment = Math.min(cursorPoints.length - 2, Math.max(0, Math.floor(frame / 26)));
  const local = (frame % 26) / 26;
  const cx = cursorPoints[segment][0] + (cursorPoints[segment + 1][0] - cursorPoints[segment][0]) * local;
  const cy = cursorPoints[segment][1] + (cursorPoints[segment + 1][1] - cursorPoints[segment][1]) * local;
  const labels = ['1 · Product', '2 · Country', '3 · Period', 'Show results'];
  return (
    <Scene duration={duration} background={C.cream}>
      <Grain />
      <div style={{position: 'absolute', left: 98, top: 58}}>
        <div style={{color: C.green, fontSize: 19, fontWeight: 800, marginBottom: 8}}>HOW IT WORKS</div>
        <div style={{fontSize: 54, fontWeight: 900, letterSpacing: -2.5, color: C.ink}}>
          Choose a product, a country, and a period.
        </div>
      </div>
      <div style={{position: 'absolute', left: 265, top: 150, width: 1390, height: 870}}>
        {steps.map((s) => <CapturedStep key={s.src} {...s} />)}
      </div>
      <div
        style={{
          position: 'absolute',
          left: cx,
          top: cy,
          width: 34,
          height: 34,
          borderRadius: '50%',
          border: '4px solid #FFFFFF',
          background: C.green,
          boxShadow: '0 5px 20px rgba(17,20,17,.3)',
          scale: 1 + Math.max(0, Math.sin(frame / 4)) * 0.08,
        }}
      />
      <div style={{position: 'absolute', top: 116, right: 95, display: 'flex', gap: 10}}>
        {labels.map((label, i) => {
          const active = Math.min(3, Math.floor(frame / 43)) === i;
          return (
            <div
              key={label}
              style={{
                borderRadius: 999,
                padding: '10px 16px',
                color: active ? '#FFFFFF' : C.green,
                background: active ? C.green : 'rgba(255,255,255,.65)',
                border: '1px solid rgba(29,81,47,.15)',
                fontSize: 15,
                fontWeight: 750,
              }}
            >
              {label}
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

const CompareMarkets: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = rise(frame, fps, 4);
  const countries = [
    {name: 'Croatia', source: 'DZS', flag: '🇭🇷', color: C.coral, x: 390},
    {name: 'Serbia', source: 'SORS', flag: '🇷🇸', color: C.lilac, x: 800},
    {name: 'Slovenia', source: 'SURS', flag: '🇸🇮', color: C.blue, x: 1210},
  ];
  return (
    <Scene duration={duration} background="linear-gradient(110deg, #C98FE1 0%, #F6A56D 50%, #CBDD92 100%)">
      <div style={{position: 'absolute', left: 105, top: 105, fontFamily: 'Georgia, Times New Roman, serif', fontSize: 52, color: C.ink}}>
        Let’s compare the market.
      </div>
      <div style={{position: 'absolute', left: 105, top: 175, fontSize: 24, color: 'rgba(17,20,17,.7)'}}>
        The same product, across each available official source.
      </div>
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        {countries.map((c) => (
          <line key={c.name} x1="960" y1="850" x2={c.x + 120} y2="535" stroke="rgba(17,20,17,.35)" strokeWidth="3" strokeDasharray="8 10" strokeDashoffset={-frame * 1.5} />
        ))}
      </svg>
      {countries.map((c, i) => {
        const np = rise(frame, fps, 10 + i * 6);
        return (
          <div
            key={c.name}
            style={{
              position: 'absolute',
              left: c.x,
              top: 390 + (i === 1 ? 35 : 0),
              width: 300,
              padding: 28,
              borderRadius: 34,
              background: 'rgba(255,255,255,.88)',
              boxShadow: '0 24px 80px rgba(17,20,17,.13)',
              opacity: np,
              scale: 0.82 + np * 0.18,
              rotate: `${(i - 1) * 2.5}deg`,
            }}
          >
            <div style={{fontSize: 54}}>{c.flag}</div>
            <div style={{marginTop: 14, fontSize: 34, fontWeight: 900, color: C.ink}}>{c.name}</div>
            <div style={{marginTop: 10, display: 'inline-block', borderRadius: 999, padding: '8px 12px', background: c.color, fontSize: 16, fontWeight: 800}}>{c.source}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 840, bottom: 90, width: 240, height: 112, borderRadius: 28, background: C.ink, color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 850, opacity: p}}>
        ONE CLEAR VIEW
      </div>
    </Scene>
  );
};

const Ready: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = rise(frame, fps, 8);
  return (
    <Scene duration={duration} background="#F7F7F4">
      {[...Array(26)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 130 + ((i * 277) % 1650),
            top: 80 + ((i * 151) % 890),
            width: 12 + (i % 4) * 5,
            height: 12 + (i % 4) * 5,
            borderRadius: i % 3 === 0 ? 5 : 99,
            background: [C.green, C.lime, C.coral, C.lilac, C.blue][i % 5],
            opacity: 0.18 + p * 0.55,
            scale: 0.4 + p * 0.6,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          left: 625,
          top: 360,
          width: 670,
          padding: '42px 48px',
          borderRadius: 34,
          background: '#FFFFFF',
          boxShadow: '0 34px 100px rgba(17,20,17,.16)',
          opacity: p,
          translate: `0px ${(1 - p) * 40}px`,
        }}
      >
        <div style={{fontSize: 21, fontWeight: 800, color: C.green, marginBottom: 14}}>✓ SEARCH COMPLETE</div>
        <div style={{fontSize: 54, fontWeight: 900, letterSpacing: -2.5, color: C.ink}}>Your market view is ready.</div>
        <div style={{marginTop: 18, fontSize: 23, color: '#5D695F'}}>Official reference · original context · source evidence</div>
      </div>
    </Scene>
  );
};

const CapabilityCarousel: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const items = [
    ['Official prices', C.lime],
    ['Source evidence', C.coral],
    ['Original currency', C.lilac],
    ['Country comparison', C.blue],
    ['Product catalogue', C.yellow],
    ['Reporting periods', C.lime],
  ] as const;
  const base = interpolate(frame, [0, duration], [150, -650], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
  return (
    <Scene duration={duration} background={C.ink}>
      <Grain dark />
      <div style={{position: 'absolute', left: 55, top: 44, color: '#FFFFFF', fontSize: 17, opacity: 0.68}}>Building your view</div>
      <div style={{position: 'absolute', right: 55, top: 44, color: '#FFFFFF', fontSize: 17, opacity: 0.68}}>6 capabilities</div>
      <div style={{position: 'absolute', left: 390, top: base, width: 1140}}>
        {items.map(([label, color], i) => (
          <div
            key={label}
            style={{
              height: 125,
              marginBottom: 22,
              borderRadius: 27,
              border: '2px solid rgba(255,255,255,.72)',
              background: i % 2 === 1 ? color : 'transparent',
              color: i % 2 === 1 ? C.ink : '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 34px',
              fontSize: 46,
              fontWeight: 800,
              letterSpacing: -1.6,
            }}
          >
            {label}
            <span style={{fontSize: 27, opacity: 0.7}}>✓</span>
          </div>
        ))}
      </div>
    </Scene>
  );
};

const ResultsProof: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = rise(frame, fps, 4);
  return (
    <Scene duration={duration} background={C.cream}>
      <Grain />
      <div style={{position: 'absolute', left: -160, top: 120, rotate: '-2.5deg', opacity: p, scale: 0.85 + p * 0.05}}>
        <BrowserFrame src="capture/08-prices-results.png" scale={0.78} objectPosition="center center" />
      </div>
      <div
        style={{
          position: 'absolute',
          right: 95,
          top: 190,
          width: 670,
          padding: '52px 54px',
          background: '#FFFFFF',
          borderRadius: 38,
          boxShadow: '0 32px 100px rgba(17,20,17,.16)',
          opacity: p,
          translate: `${(1 - p) * 55}px 0px`,
        }}
      >
        <div style={{color: C.green, fontSize: 19, fontWeight: 850, letterSpacing: 1}}>PRICE + CONTEXT</div>
        <div style={{marginTop: 22, fontFamily: 'Georgia, Times New Roman, serif', fontSize: 56, lineHeight: 1.05, color: C.ink}}>
          A number is only useful when its source is clear.
        </div>
        <div style={{marginTop: 34, display: 'grid', gap: 18}}>
          {['Original source value', 'Reporting period', 'Official source evidence'].map((line, i) => (
            <div key={line} style={{display: 'flex', alignItems: 'center', gap: 16, fontSize: 24, fontWeight: 720, color: C.green}}>
              <span style={{width: 30, height: 30, borderRadius: 9, background: [C.lime, C.coral, C.lilac][i], display: 'grid', placeItems: 'center', color: C.ink, fontSize: 16}}>✓</span>
              {line}
            </div>
          ))}
        </div>
      </div>
    </Scene>
  );
};

const EvidenceCards: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const cards = [
    {country: 'Croatia', flag: '🇭🇷', source: 'DZS', color: C.coral},
    {country: 'Serbia', flag: '🇷🇸', source: 'SORS', color: C.lilac},
    {country: 'Slovenia', flag: '🇸🇮', source: 'SURS', color: C.blue},
  ];
  const x = interpolate(frame, [0, duration], [120, -80], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
  return (
    <Scene duration={duration} background="#F7F6F2">
      <div style={{position: 'absolute', left: 95, top: 88, fontSize: 72, lineHeight: 0.98, fontWeight: 900, letterSpacing: -4, color: C.ink}}>
        Compare availability.<br />Keep the source attached.
      </div>
      <div style={{position: 'absolute', left: x, top: 420, display: 'flex', gap: 34}}>
        {cards.map((card, i) => (
          <div
            key={card.country}
            style={{
              width: 600,
              height: 430,
              padding: 40,
              borderRadius: 42,
              background: '#FFFFFF',
              boxShadow: '0 30px 80px rgba(17,20,17,.11)',
              borderTop: `12px solid ${card.color}`,
              rotate: `${(i - 1) * 1.8}deg`,
            }}
          >
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{fontSize: 68}}>{card.flag}</div>
              <div style={{padding: '10px 14px', borderRadius: 999, background: card.color, color: C.ink, fontWeight: 900}}>{card.source}</div>
            </div>
            <div style={{marginTop: 30, fontSize: 49, fontWeight: 900, color: C.ink}}>{card.country}</div>
            <div style={{marginTop: 18, fontSize: 23, color: '#657067'}}>Official reference availability</div>
            <div style={{marginTop: 46, height: 10, borderRadius: 99, background: '#E7ECE5', overflow: 'hidden'}}>
              <div style={{width: `${62 + i * 12}%`, height: '100%', background: C.green, borderRadius: 99}} />
            </div>
            <div style={{marginTop: 24, color: C.green, fontSize: 19, fontWeight: 800}}>View source evidence →</div>
          </div>
        ))}
      </div>
    </Scene>
  );
};

const Chat: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const q = rise(frame, fps, 2);
  const a = rise(frame, fps, 27);
  return (
    <Scene duration={duration} background="#F7F7F5">
      <div style={{position: 'absolute', left: 365, top: 340, width: 1190}}>
        <div style={{display: 'flex', gap: 20, alignItems: 'center', opacity: q}}>
          <div style={{width: 62, height: 62, borderRadius: 20, background: '#FFFFFF', boxShadow: '0 12px 35px rgba(17,20,17,.12)', display: 'grid', placeItems: 'center', fontSize: 26}}>👤</div>
          <div style={{padding: '24px 30px', background: '#FFFFFF', borderRadius: 28, fontSize: 32, color: C.ink, boxShadow: '0 18px 55px rgba(17,20,17,.1)'}}>
            Can I trace the source behind this reference?
          </div>
        </div>
        <div style={{display: 'flex', gap: 20, alignItems: 'center', marginTop: 48, marginLeft: 250, opacity: a, translate: `${(1 - a) * 40}px 0px`}}>
          <div style={{width: 62, height: 62, borderRadius: 20, background: C.lime, display: 'grid', placeItems: 'center', fontWeight: 900, color: C.ink}}>YF</div>
          <div style={{padding: '24px 30px', background: C.green, borderRadius: 28, fontSize: 32, color: '#FFFFFF', boxShadow: '0 18px 55px rgba(17,20,17,.14)'}}>
            Yes. Every record keeps its source evidence.
          </div>
        </div>
      </div>
    </Scene>
  );
};

const Catalogue: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = rise(frame, fps, 4);
  return (
    <Scene duration={duration} background={C.cream}>
      <Grain />
      <div style={{position: 'absolute', right: -90, top: 105, rotate: '2.3deg', opacity: p}}>
        <BrowserFrame src="capture/10-products.png" scale={0.74} />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(244,240,230,1) 0%, rgba(244,240,230,.98) 39%, rgba(244,240,230,.1) 73%, transparent 100%)'}} />
      <div style={{position: 'absolute', left: 110, top: 245, width: 750, opacity: p, translate: `${(1 - p) * -40}px 0px`}}>
        <div style={{fontSize: 20, color: C.green, fontWeight: 850, letterSpacing: 2}}>PRODUCT CATALOGUE</div>
        <div style={{marginTop: 25, fontSize: 94, lineHeight: 0.95, letterSpacing: -5, fontWeight: 900, color: C.ink}}>
          137 products.<br />One regional catalogue.
        </div>
        <div style={{marginTop: 36, fontFamily: 'Georgia, Times New Roman, serif', fontSize: 32, lineHeight: 1.35, color: C.green}}>
          Browse by category, country, and price-data availability.
        </div>
      </div>
    </Scene>
  );
};

const CloudCTA: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const icons = ['🥔', '🍅', '🥛', '🌾', '🍎', '🐟', '🫑', '🫒'];
  return (
    <Scene duration={duration} background="#F6F4EF">
      <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}>
        <div style={{fontFamily: 'Georgia, Times New Roman, serif', fontSize: 56, color: C.ink}}>Explore Yugofarmia.</div>
      </div>
      {icons.map((icon, i) => {
        const angle = (i / icons.length) * Math.PI * 2 + frame / 80;
        const r = 330 + (i % 2) * 90;
        return (
          <div
            key={`${icon}-${i}`}
            style={{
              position: 'absolute',
              left: 960 + Math.cos(angle) * r - 42,
              top: 540 + Math.sin(angle) * r * 0.55 - 42,
              width: 84,
              height: 84,
              borderRadius: 24,
              background: [C.lime, C.coral, C.lilac, C.blue, C.yellow][i % 5],
              display: 'grid',
              placeItems: 'center',
              fontSize: 41,
              boxShadow: '0 18px 50px rgba(17,20,17,.12)',
              rotate: `${Math.sin(frame / 15 + i) * 9}deg`,
            }}
          >
            {icon}
          </div>
        );
      })}
    </Scene>
  );
};

const EndCard: React.FC<{duration: number; showUrl: boolean}> = ({duration, showUrl}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = rise(frame, fps, 2);
  return (
    <Scene duration={duration} background={C.ink} noFadeOut>
      <Grain dark />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 110, opacity: p}}>
        <Brand dark />
        {showUrl ? (
          <div style={{border: '1px solid rgba(255,255,255,.45)', borderRadius: 999, padding: '17px 27px', color: '#FFFFFF', fontSize: 20, letterSpacing: 0.5}}>
            yugofarmia.com
          </div>
        ) : null}
      </div>
    </Scene>
  );
};

export const YugofarmiaFilm: React.FC<YugofarmiaFilmProps> = ({soundtrackVolume, showUrl}) => {
  const scenes = [
    {from: 0, duration: 110, node: <Opening duration={110} />},
    {from: 95, duration: 110, node: <Network duration={110} />},
    {from: 190, duration: 55, node: <LogoCard duration={55} />},
    {from: 230, duration: 115, node: <Conversation duration={115} />},
    {from: 330, duration: 70, node: <Analyzer duration={70} />},
    {from: 385, duration: 190, node: <Walkthrough duration={190} />},
    {from: 560, duration: 90, node: <CompareMarkets duration={90} />},
    {from: 635, duration: 75, node: <Ready duration={75} />},
    {from: 695, duration: 125, node: <CapabilityCarousel duration={125} />},
    {from: 805, duration: 120, node: <ResultsProof duration={120} />},
    {from: 910, duration: 115, node: <EvidenceCards duration={115} />},
    {from: 1010, duration: 70, node: <Chat duration={70} />},
    {from: 1065, duration: 70, node: <Catalogue duration={70} />},
    {from: 1120, duration: 40, node: <CloudCTA duration={40} />},
    {from: 1145, duration: 30, node: <EndCard duration={30} showUrl={showUrl} />},
  ];

  return (
    <AbsoluteFill style={{background: C.ink}}>
      {scenes.map((scene, index) => (
        <Sequence key={index} from={scene.from} durationInFrames={scene.duration} layout="absolute-fill">
          {scene.node}
        </Sequence>
      ))}
      <Audio src={staticFile('soundtrack.wav')} volume={soundtrackVolume} />
      {[236, 258, 404, 430, 456, 482, 510, 559].map((from, index) => (
        <Sequence key={from} from={from} durationInFrames={12} layout="none">
          <Audio src={staticFile('click.wav')} volume={0.12 + index * 0.01} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
