import React from 'react';
import {
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {products} from './data';
import {C, Grain, Scene, clamp, enter} from './common';

const ProductTile: React.FC<{index: number; scroll: number}> = ({index, scroll}) => {
  const product = products[index];
  const raw = ((index - scroll + 2) % products.length + products.length) % products.length - 2;
  const distance = Math.abs(raw);
  const x = 960 + raw * 505;
  const scale = interpolate(distance, [0, 1, 1.75], [1, 0.78, 0.52], clamp);
  const opacity = interpolate(distance, [0, 1.35, 1.9], [1, 0.72, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 245,
        top: 270 + distance * 62,
        width: 490,
        height: 575,
        borderRadius: 42,
        background: '#FFFFFF',
        border: '1px solid rgba(255,255,255,.55)',
        boxShadow: distance < 0.55 ? '0 44px 110px rgba(0,0,0,.28)' : '0 24px 62px rgba(0,0,0,.16)',
        overflow: 'hidden',
        opacity,
        scale,
        rotate: `${raw * -4.5}deg`,
        zIndex: Math.round(20 - distance * 5),
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 35%, ${product.accent} 0%, rgba(255,255,255,.88) 58%, #FFFFFF 100%)`,
        }}
      />
      <Img
        src={staticFile(product.asset)}
        style={{
          position: 'absolute',
          left: 50,
          top: 48,
          width: 390,
          height: 350,
          objectFit: 'contain',
          filter: 'drop-shadow(0 30px 28px rgba(16,42,27,.18))',
          scale: 1.02 - Math.min(0.15, distance * 0.06),
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 34,
          right: 34,
          bottom: 30,
          borderRadius: 28,
          background: 'rgba(255,255,255,.88)',
          padding: '24px 28px',
        }}
      >
        <div
          style={{
            color: C.muted,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 15,
            fontWeight: 760,
            letterSpacing: 2.4,
            textTransform: 'uppercase',
          }}
        >
          {product.category}
        </div>
        <div
          style={{
            marginTop: 9,
            color: C.ink,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 42,
            lineHeight: 1,
            letterSpacing: -1.8,
            fontWeight: 900,
          }}
        >
          {product.name}
        </div>
      </div>
    </div>
  );
};

export const ProductsScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const heading = enter(frame, fps, 0);
  const scroll = interpolate(frame, [12, duration - 10], [0, 3.22], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  return (
    <Scene duration={duration} background={C.dark}>
      <Grain dark />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 62,
          textAlign: 'center',
          opacity: heading,
          translate: `0px ${(1 - heading) * 24}px`,
        }}
      >
        <div
          style={{
            color: C.lime,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          Browse the catalogue
        </div>
        <div
          style={{
            marginTop: 12,
            color: '#FFFFFF',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 70,
            lineHeight: 1,
            letterSpacing: -3.8,
            fontWeight: 900,
          }}
        >
          Choose a product
        </div>
      </div>
      {products.map((product, index) => (
        <ProductTile key={product.name} index={index} scroll={scroll} />
      ))}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 62,
          display: 'flex',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        {products.map((product, index) => {
          const distance = Math.abs((((index - scroll + 2) % 4 + 4) % 4) - 2);
          return (
            <div
              key={product.name}
              style={{
                width: distance < 0.5 ? 58 : 13,
                height: 13,
                borderRadius: 99,
                background: distance < 0.5 ? C.lime : 'rgba(255,255,255,.28)',
              }}
            />
          );
        })}
      </div>
    </Scene>
  );
};
