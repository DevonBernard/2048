import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useWallet } from '@solana/wallet-adapter-react';

import { dismissAction, resetAction } from '../actions';
import { StateType } from '../reducers';
import { apiCall } from '../utils/network';

const Overlay: React.FC = () => {
  const dispatch = useDispatch();
  const { publicKey } = useWallet();
  const dismiss = useCallback(() => dispatch(dismissAction()), [dispatch]);

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

  if (victory) {
    return (
      <div className="overlay overlay-victory">
        <h1>You win!</h1>
        <div className="overlay-buttons">
          <button onClick={dismiss}>Keep going</button>
          <button onClick={reset}>Try again</button>
        </div>
      </div>
    );
  }

  if (defeat) {
    return (
      <div className="overlay overlay-defeat">
        <h1>Game over!</h1>
        <div className="overlay-buttons">
          <button onClick={reset}>Try again</button>
        </div>
      </div>
    );
  }

  return null;
};

export default Overlay;
