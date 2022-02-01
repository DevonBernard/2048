import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useWallet } from '@solana/wallet-adapter-react';
import classNames from 'classnames';

import { WalletButton } from '../components/Wallet';
import { dismissAction, resetAction } from '../actions';
import { StateType } from '../reducers';
import { apiCall } from '../utils/network';

const Modal: any = ({
  show,
  setShow,
  username,
  setUsername,
  branding,
}: {
  show: boolean;
  setShow: any;
  username: string;
  setUsername: any;
  branding: any;
}) => {
  const [tempUsername, setTempUsername] = useState('');
  const [pw, setPw] = useState('');

  const { publicKey } = useWallet();

  const hide = () => {
    setShow(false);
    setTempUsername('');
    setPw('');
  };

  useEffect(() => {
    if (publicKey) {
      hide();
    }
  }, [publicKey]);

  return (
    <div className={classNames('overlay', { hide: !show })}>
      <div
        className="overlay-capture"
        onClick={evt => {
          hide();
        }}
      />
      <div className="overlay-card">
        <img src={branding.imageUrl} className="logo" />
        {username && (
          <button
            onClick={evt => {
              setUsername('');
              hide();
            }}
          >
            Logout
          </button>
        )}
        {!username && !publicKey && (
          <div className="overlay-center">
            <input
              name="username"
              type="text"
              placeholder="username"
              value={tempUsername}
              onChange={evt => {
                setTempUsername(evt.target.value);
              }}
            />
            <input
              name="password"
              type="password"
              placeholder="password"
              value={pw}
              onChange={evt => {
                setPw(evt.target.value);
              }}
            />
            <button
              style={{ backgroundColor: branding.palette.primary }}
              onClick={evt => {
                setUsername(tempUsername);
                hide();
              }}
            >
              Login
            </button>
            <div className="divisor">
              <span>OR</span>
            </div>
          </div>
        )}
        {!username && <WalletButton />}
      </div>
    </div>
  );
};

export default Modal;
