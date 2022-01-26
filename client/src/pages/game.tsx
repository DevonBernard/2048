import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

import Header from '../components/Header';
import Board from '../components/Board';

import BoardSizePicker from '../components/BoardSizePicker';
import { WalletButton } from '../components/Wallet';

export const GamePage: React.FC = () => {
  const { publicKey } = useWallet();

  return (
    <div>
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
    </div>
  );
};
