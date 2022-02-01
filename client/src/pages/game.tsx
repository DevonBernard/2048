import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useWallet } from '@solana/wallet-adapter-react';

import Header from '../components/Header';
import Board from '../components/Board';
import { apiCall } from '../utils/network';

import BoardSizePicker from '../components/BoardSizePicker';
import { PowerUp } from '../components/PowerUp';
import Modal from '../components/Modal';
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

const challengeLibrary = [
  {
    name: 'runes',
    imageUrl:
      'https://static.ftx.com/nfts/5f2061e8-b185-41af-a2e3-e14ffcd31f07.png',
  },
  {
    name: 'invisible',
    imageUrl:
      'https://static.ftx.com/nfts/cb53e027-0a4c-40a3-a505-8aa513f42a07.png',
  },
];

const initialPowerUps = {
  red: false,
  green: false,
  blue: false,
};

const initialChallenges = {
  runes: false,
  invisible: false,
};

const brands = {
  xbox: {
    imageUrl: '/images/xbox.png',
    palette: {
      primary: '#0e7a0d',
    },
  },
  nintendo: {
    imageUrl: '/images/nintendo.png',
    palette: {
      primary: '#fe171c',
    },
  },
};

export const GamePage: React.FC = () => {
  const dispatch = useDispatch();
  const { publicKey } = useWallet();
  const [nfts, setNfts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [powerUps, setPowerUps]: [any, any] = useState({});
  const [ownedPowerUps, setOwnedPowerups]: [{ [key: string]: boolean }, any] =
    useState(initialPowerUps);
  const [accountId, setAccountId] = useState('');
  const [username, setUsername] = useState('');

  const [challenges, setChallenges]: [any, any] = useState(initialChallenges);
  const [ownedChallenges, setOwnedChallenges]: [
    { [key: string]: boolean },
    any
  ] = useState(initialChallenges);
  const branding = brands.xbox;

  useEffect(() => {
    if (publicKey || username) {
      apiCall('POST', '/auth', { address: publicKey, username: username }).then(
        authResp => {
          if (authResp.respJson.success) {
            if (authResp.respJson.result.highScore) {
              dispatch(setBestScore(authResp.respJson.result.highScore));
            }
            const { accountId } = authResp.respJson.result;
            setAccountId(accountId);
            apiCall('GET', `/users/nfts?accountId=${accountId}`).then(
              (nftResp: any) => {
                console.log('User NFTs', nftResp);
                if (nftResp.respJson.success) {
                  const newOwnedPowerUps = JSON.parse(
                    JSON.stringify(ownedPowerUps)
                  );
                  const newChallenges = JSON.parse(
                    JSON.stringify(ownedChallenges)
                  );
                  nftResp.respJson.result.forEach((nft: any) => {
                    if (nft.attributes && nft.attributes.powerup) {
                      newOwnedPowerUps[nft.attributes.powerup] = true;
                    }
                    if (nft.attributes && nft.attributes.challenge) {
                      newChallenges[nft.attributes.challenge] = true;
                    }
                  });
                  setOwnedPowerups(newOwnedPowerUps);
                  setOwnedChallenges(newChallenges);
                }
              }
            );
          } else {
            alert('Failed to login');
          }
        }
      );
    } else {
      setShowModal(false);
      setUsername('');
      setAccountId('');
      setNfts([]);
      setPowerUps({});
      setOwnedPowerups(initialPowerUps);
      setChallenges(initialChallenges);
      setOwnedChallenges(initialChallenges);
      dispatch(setBestScore(0));
    }
  }, [publicKey, username]);

  const requestNft = (name: string, callback: any) => {
    if (accountId) {
      apiCall('POST', '/nfts/award', { accountId: accountId, name: name }).then(
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
            if (nft?.attributes && nft?.attributes?.challenge) {
              const newOwnedChallenges = JSON.parse(
                JSON.stringify(ownedChallenges)
              );
              newOwnedChallenges[nft.attributes.challenge] = true;
              setOwnedChallenges(newOwnedChallenges);
              callback(nft);
            }
          }
        }
      );
    }
  };

  return (
    <div>
      <Header
        setShowModal={setShowModal}
        accountId={accountId}
        branding={branding}
      />
      <Modal
        show={showModal}
        setShow={setShowModal}
        username={username}
        setUsername={setUsername}
        accountId={accountId}
        branding={branding}
      />
      <Board
        requestNft={requestNft}
        powerUps={powerUps}
        ownedPowerUps={ownedPowerUps}
        challenges={challenges}
        ownedChallenges={ownedChallenges}
        accountId={accountId}
      />
      {/* <BoardSizePicker /> */}
      <h2 style={{ marginBottom: 0 }}>Powerups</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '3em' }}>
        {powerUpLibrary.colors.map(powerUp => (
          <PowerUp
            key={powerUp.name}
            powerUp={powerUp}
            owned={ownedPowerUps[powerUp.name]}
            powerUps={powerUps}
            setPowerUps={setPowerUps}
            challenges={challenges}
            setChallenges={setChallenges}
            challenge={false}
          />
        ))}
      </div>
      <h2 style={{ marginBottom: 0 }}>Challenges</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '3em' }}>
        {challengeLibrary.map(challenge => (
          <PowerUp
            key={challenge.name}
            powerUp={challenge}
            owned={ownedChallenges[challenge.name]}
            powerUps={powerUps}
            setPowerUps={setPowerUps}
            challenges={challenges}
            setChallenges={setChallenges}
            challenge={true}
          />
        ))}
      </div>
    </div>
  );
};
