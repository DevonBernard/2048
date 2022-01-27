import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useWallet } from '@solana/wallet-adapter-react';

import Header from '../components/Header';
import Board from '../components/Board';
import { apiCall } from '../utils/network';

import BoardSizePicker from '../components/BoardSizePicker';
import { PowerUp } from '../components/PowerUp';
import { setBestScore } from '../actions';

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

const initialPowerUps = {
  red: false,
  green: false,
  blue: false,
};

export const GamePage: React.FC = () => {
  const dispatch = useDispatch();
  const { publicKey } = useWallet();
  const [nfts, setNfts] = useState([]);
  const [powerUps, setPowerUps]: [any, any] = useState({});
  const [ownedPowerUps, setOwnedPowerups]: [{ [key: string]: boolean }, any] =
    useState(initialPowerUps);

  useEffect(() => {
    if (publicKey) {
      apiCall('POST', '/auth', { address: publicKey }).then(authResp => {
        if (authResp.respJson.success) {
          if (authResp.respJson.result.highScore) {
            dispatch(setBestScore(authResp.respJson.result.highScore));
          }
          apiCall('GET', `/users/nfts?address=${publicKey}`).then(
            (nftResp: any) => {
              console.log('User NFTs', nftResp);
              if (nftResp.respJson.success) {
                const newOwnedPowerUps = JSON.parse(
                  JSON.stringify(ownedPowerUps)
                );
                nftResp.respJson.result.forEach((nft: any) => {
                  if (nft.attributes && nft.attributes.powerup) {
                    newOwnedPowerUps[nft.attributes.powerup] = true;
                  }
                });
                setOwnedPowerups(newOwnedPowerUps);
              }
            }
          );
        } else {
          alert('Failed to login');
        }
      });
    } else {
      setNfts([]);
      setOwnedPowerups(initialPowerUps);
      setPowerUps({});
    }
  }, [publicKey]);

  const requestNft = (name: string, callback: any) => {
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
              callback(nft);
            }
          }
        }
      );
    }
  };

  return (
    <div>
      <Header />
      <Board
        powerUps={powerUps}
        requestNft={requestNft}
        ownedPowerUps={ownedPowerUps}
      />
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
