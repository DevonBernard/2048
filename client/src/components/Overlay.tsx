import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useWallet } from '@solana/wallet-adapter-react';
import classNames from 'classnames';
// @ts-ignore
import confetti from 'canvas-confetti';

import { dismissAction, resetAction } from '../actions';
import { StateType } from '../reducers';
import { apiCall } from '../utils/network';

export const customConfetti = () => {
  confetti({
    particleCount: 400,
    spread: 100,
    origin: {
      x: 0.5,
      y: 0.7,
    },
  });
};

const Overlay: any = ({
  requestNft,
  ownedPowerUps,
  challenges,
  ownedChallenges,
}: {
  requestNft: any;
  ownedPowerUps: any;
  challenges: any;
  ownedChallenges: any;
}) => {
  const dispatch = useDispatch();
  const { publicKey } = useWallet();
  const dismiss = useCallback(() => dispatch(dismissAction()), [dispatch]);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [newNft, setNewNft]: [any, any] = useState({});
  const unownedPowerUps: any = Object.entries(ownedPowerUps).reduce(
    (agg: any, [name, value]: any) => {
      if (!value) {
        agg.push(name);
      }
      return agg;
    },
    []
  );
  const activeUnownedChallenges = Object.entries(challenges).reduce(
    (agg: any, [name, value]: any) => {
      if (value && name in ownedChallenges && !ownedChallenges[name]) {
        agg.push(name);
      }
      return agg;
    },
    []
  );

  const defeat = useSelector((state: StateType) => state.defeat);
  const victory = useSelector(
    (state: StateType) => state.victory && !state.victoryDismissed
  );
  const score = useSelector((state: StateType) => state.score);
  const best = useSelector((state: StateType) => state.best);

  const reset = useCallback(() => {
    if (score === best) {
      apiCall('POST', '/highscores', { address: publicKey, highScore: best });
    }
    dispatch(resetAction());
  }, [dispatch, score, best]);

  const claimPrizeButton = (
    <button
      onClick={async () => {
        if (!claiming) {
          setClaiming(true);
          let randomNft = null;
          if (activeUnownedChallenges.length > 0) {
            randomNft =
              activeUnownedChallenges[
                Math.floor(Math.random() * activeUnownedChallenges.length)
              ];
          } else if (unownedPowerUps.length > 0) {
            randomNft =
              unownedPowerUps[
                Math.floor(Math.random() * unownedPowerUps.length)
              ];
          }

          if (randomNft) {
            requestNft(randomNft, (nft: any) => {
              setNewNft(nft);
              setClaiming(false);
            });
          } else {
            setClaiming(false);
          }
        }
      }}
    >
      Claim {activeUnownedChallenges.length > 0 && 'Challenge '}Prize
    </button>
  );

  if (Object.keys(newNft).length > 0) {
    return (
      <div className="overlay overlay-prize">
        <div
          className={classNames('flip-box', {
            flipped: cardFlipped,
            'animate-card': !cardFlipped,
          })}
          onMouseMove={evt => {
            if (!cardFlipped) {
              customConfetti();
              setCardFlipped(true);
            }
          }}
        >
          <div className="flip-box-inner">
            <div className="flip-box-front">
              <div className="flip-box-center">?</div>
            </div>
            <div className="flip-box-back">
              <div className="flip-box-center">
                <img src={newNft?.imageUrl} />
                {newNft?.attributes?.powerup || newNft?.attributes?.challenge}
              </div>
            </div>
          </div>
        </div>
        <div className="overlay-buttons">
          <button
            onClick={() => {
              reset();
              setNewNft({});
              setCardFlipped(false);
            }}
          >
            New Game
          </button>
        </div>
      </div>
    );
  }

  if (victory) {
    return (
      <div className="overlay overlay-victory">
        <h1>You win!</h1>
        <div className="overlay-buttons">
          <button onClick={dismiss}>Keep going</button>
          {publicKey &&
          score > 100 &&
          (unownedPowerUps.length > 0 || activeUnownedChallenges.length > 0) ? (
            claimPrizeButton
          ) : (
            <button onClick={reset}>Try again</button>
          )}
        </div>
      </div>
    );
  }

  if (defeat) {
    return (
      <div className="overlay overlay-defeat">
        <h1>Game over!</h1>
        <div className="overlay-buttons">
          {publicKey &&
          score > 100 &&
          (unownedPowerUps.length > 0 || activeUnownedChallenges.length > 0) ? (
            claimPrizeButton
          ) : (
            <button onClick={reset}>Try again</button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default Overlay;
