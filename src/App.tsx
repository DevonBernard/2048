import React from 'react';
import './App.scss';

import { animationDuration, gridGap } from './config';
import Header from './components/Header';
import Board from './components/Board';
import Info from './components/Info';
import BoardSizePicker from './components/BoardSizePicker';
import { WalletButton } from './components/Wallet';

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
        <Header />
        <div
          style={{
            marginBottom: '1.5em',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <WalletButton />
        </div>
        <Board />
        <BoardSizePicker />
        <Info />
      </div>
    </div>
  );
};

export default App;
