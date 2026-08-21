import React from 'react';
import {Composition} from 'remotion';
import {YugofarmiaShort} from './YugofarmiaShort';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="YugofarmiaShort"
    component={YugofarmiaShort}
    durationInFrames={630}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{soundtrackVolume: 0.34}}
  />
);
