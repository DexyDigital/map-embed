import React from 'react';
import {Composition} from 'remotion';
import {YugofarmiaFilm} from './YugofarmiaFilm';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="YugofarmiaFilm"
    component={YugofarmiaFilm}
    durationInFrames={1175}
    fps={25}
    width={1920}
    height={1080}
    defaultProps={{soundtrackVolume: 0.38, showUrl: true}}
  />
);
