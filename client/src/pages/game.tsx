import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

import Header from '../components/Header';
import Board from '../components/Board';
import { apiCall } from '../utils/network';

import BoardSizePicker from '../components/BoardSizePicker';
import { WalletButton } from '../components/Wallet';

export const GamePage: React.FC = () => {
  const { publicKey } = useWallet();
  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    if (publicKey) {
      apiCall('POST', '/auth', { address: publicKey }).then(authResp => {
        apiCall('GET', `/users/nfts?address=${publicKey}`).then(
          (nftResp: any) => {
            console.log('User NFTs', nftResp);
            if (nftResp.respJson.success) {
              setNfts(nftResp.respJson.result);
              const respPowerUps = nftResp.respJson.result.reduce(
                (agg: any, nft: any) => {
                  if (nft.attributes && nft.attributes.powerup) {
                    agg[nft.attributes.powerup] = true;
                  }
                  return agg;
                },
                {}
              );
            }
          }
        );
      });
    }
  }, [publicKey]);

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
