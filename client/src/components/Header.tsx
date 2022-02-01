import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useWallet } from '@solana/wallet-adapter-react';

import { resetAction, undoAction } from '../actions';
import { StateType } from '../reducers';
import { apiCall } from '../utils/network';

const Header: any = ({
  setShowModal,
  accountId,
  branding,
}: {
  setShowModal: any;
  accountId: string;
  branding: any;
}) => {
  const dispatch = useDispatch();
  const { publicKey } = useWallet();
  const undo = useCallback(() => dispatch(undoAction()), [dispatch]);

  const score = useSelector((state: StateType) => state.score);
  const scoreIncrease = useSelector((state: StateType) => state.scoreIncrease);
  const moveId = useSelector((state: StateType) => state.moveId);
  const best = useSelector((state: StateType) => state.best);
  const previousBoard = useSelector((state: StateType) => state.previousBoard);

  const reset = useCallback(() => {
    if (score === best) {
      apiCall('POST', '/highscores', { accountId: accountId, highScore: best });
    }
    dispatch(resetAction());
  }, [dispatch, score, best]);

  return (
    <div className="header">
      <div className="header-row">
        <div>
          <div style={{ fontSize: 50, fontWeight: 'bold' }}>2048:FTX</div>
          <div className="header-buttons">
            <button
              onClick={reset}
              style={{ backgroundColor: branding.palette.primary }}
            >
              New game
            </button>
          </div>
        </div>
        <div className="account-info">
          <button
            style={{ backgroundColor: branding.palette.primary }}
            onClick={evt => {
              setShowModal(true);
            }}
          >
            {accountId
              ? accountId.length > 15
                ? `${accountId.substring(0, 12)}...`
                : accountId
              : 'Login / Register'}
          </button>
          <div className="header-scores">
            <div className="header-scores-score">
              <div>Score</div>
              <div>{score}</div>
              {!!scoreIncrease && (
                <div className="header-scores-score-increase" key={moveId}>
                  +{scoreIncrease}
                </div>
              )}
            </div>
            <div className="header-scores-score">
              <div>Best</div>
              <div>{best}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
