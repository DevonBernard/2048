import React from 'react';
import './App.scss';

import { animationDuration, gridGap } from './config';
import { GamePage } from './pages/game';

const App: React.FC = () => {
  return (
    <div
      className="app"
      style={
        {
          '--animation-duration': animationDuration + 'ms',
          '--grid-gap': gridGap,
        } as any
      }
    >
      <div className="page">
        <GamePage />
      </div>
    </div>
  );
};

export default App;
