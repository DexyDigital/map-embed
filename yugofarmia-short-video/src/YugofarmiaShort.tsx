import React from 'react';
import {Audio} from '@remotion/media';
import {AbsoluteFill, Sequence, staticFile} from 'remotion';
import {HomepageScene} from './HomepageScene';
import {ProductsScene} from './ProductsScene';
import {PricesScene} from './PricesScene';
import {SourcesScene} from './SourcesScene';
import {ComingSoonScene} from './ComingSoonScene';
import {OutroScene} from './OutroScene';
import {C} from './common';

export type YugofarmiaShortProps = {
  soundtrackVolume: number;
};

export const YugofarmiaShort: React.FC<YugofarmiaShortProps> = ({soundtrackVolume}) => (
  <AbsoluteFill style={{background: C.cream}}>
    <Audio src={staticFile('soundtrack.wav')} volume={soundtrackVolume} />
    <Sequence from={0} durationInFrames={90}>
      <HomepageScene duration={90} />
    </Sequence>
    <Sequence from={80} durationInFrames={145}>
      <ProductsScene duration={145} />
    </Sequence>
    <Sequence from={215} durationInFrames={195}>
      <PricesScene duration={195} />
    </Sequence>
    <Sequence from={400} durationInFrames={105}>
      <SourcesScene duration={105} />
    </Sequence>
    <Sequence from={495} durationInFrames={70}>
      <ComingSoonScene duration={70} />
    </Sequence>
    <Sequence from={555} durationInFrames={75}>
      <OutroScene duration={75} />
    </Sequence>
  </AbsoluteFill>
);
