import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
} from 'remotion';

export const C = {
  green: '#1D512F',
  green2: '#27613A',
  dark: '#102A1B',
  cream: '#F6F5F0',
  paper: '#FFFFFF',
  mist: '#E9EFEA',
  ink: '#101712',
  muted: '#69756C',
  lime: '#D8F18C',
  line: 'rgba(29,81,47,0.14)',
};

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);

export const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

export const enter = (
  frame: number,
  fps: number,
  delay = 0,
  damping = 18,
) =>
  spring({
    fps,
    frame: Math.max(0, frame - delay),
    config: {damping, stiffness: 115, mass: 0.78},
  });

const sceneOpacity = (frame: number, duration: number, fade = 11) =>
  interpolate(frame, [0, fade, duration - fade, duration], [0, 1, 1, 0], {
    ...clamp,
    easing: [easeOut, Easing.linear, easeIn],
  });

export const Grain: React.FC<{dark?: boolean}> = ({dark = false}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      opacity: dark ? 0.08 : 0.05,
      mixBlendMode: dark ? 'screen' : 'multiply',
      backgroundImage:
        'radial-gradient(circle at 20% 30%, rgba(255,255,255,.55) 0 1px, transparent 1.25px), radial-gradient(circle at 75% 70%, rgba(0,0,0,.34) 0 1px, transparent 1.25px)',
      backgroundSize: '16px 16px, 21px 21px',
    }}
  />
);

export const Scene: React.FC<{
  duration: number;
  background: string;
  children: React.ReactNode;
  holdEnd?: boolean;
}> = ({duration, background, children, holdEnd = false}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background,
        opacity: holdEnd
          ? interpolate(frame, [0, 12], [0, 1], {...clamp, easing: easeOut})
          : sceneOpacity(frame, duration),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
