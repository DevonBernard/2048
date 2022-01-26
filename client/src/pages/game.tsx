import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

import Header from '../components/Header';
import Board from '../components/Board';
import { apiCall } from '../utils/network';

import BoardSizePicker from '../components/BoardSizePicker';
import { WalletButton } from '../components/Wallet';
import { PowerUp } from '../components/PowerUp';

const powerUpLibrary = {
  colors: [
    {
      name: 'red',
      imageUrl:
        'https://static.ftx.com/nfts/2b92722c-f0e0-4725-af8a-d85d3d9f11ea.png',
    },
    {
      name: 'green',
      imageUrl:
        'https://static.ftx.com/nfts/1ebbbbd5-ae7a-461d-839c-7cd61de94424.png',
    },
    {
      name: 'blue',
      imageUrl:
        'https://static.ftx.com/nfts/5a0eb2f2-8a4a-442b-b1fa-ee49690f441d.png',
    },
  ],
};

export const GamePage: React.FC = () => {
  const { publicKey } = useWallet();
  const [nfts, setNfts] = useState([]);
  const [powerUps, setPowerUps]: [any, any] = useState({});
  const [ownedPowerUps, setOwnedPowerups]: [{ [key: string]: boolean }, any] =
    useState({});

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
              setOwnedPowerups(respPowerUps);
            }
          }
        );
      });
    } else {
      setNfts([]);
      setOwnedPowerups({});
    }
  }, [publicKey]);

  const requestNft = (name: string) => {
    if (publicKey) {
      apiCall('POST', '/nfts/award', { address: publicKey, name: name }).then(
        awardResp => {
          if (awardResp.respJson.success) {
            const nft = awardResp.respJson.result;
            let newNfts = JSON.parse(JSON.stringify(nfts));
            newNfts.push(nft);
            setNfts(newNfts);
            if (nft?.attributes && nft?.attributes?.powerup) {
              const newOwnedPowerUps = JSON.parse(
                JSON.stringify(ownedPowerUps)
              );
              newOwnedPowerUps[nft.attributes.powerup] = true;
              setOwnedPowerups(newOwnedPowerUps);
            }
          }
        }
      );
    }
  };

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
      <Board powerUps={powerUps} />
      <BoardSizePicker />
      <h2 style={{ marginBottom: 0 }}>Powerups</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '3em' }}>
        {powerUpLibrary.colors.map(powerUp => (
          <PowerUp
            key={powerUp.name}
            powerUp={powerUp}
            owned={ownedPowerUps[powerUp.name]}
            powerUps={powerUps}
            setPowerUps={setPowerUps}
          />
        ))}
      </div>
    </div>
  );
};
