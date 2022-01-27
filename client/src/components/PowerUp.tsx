import React from 'react';
import classNames from 'classnames';

export const PowerUp: any = ({
  owned,
  powerUp,
  powerUps,
  setPowerUps,
  challenge = false,
}: {
  owned: boolean;
  powerUp: any;
  powerUps: any;
  setPowerUps: any;
  challenge?: boolean;
}) => {
  const togglePowerUp = () => {
    const newPowerUps = JSON.parse(JSON.stringify(powerUps));
    if (['red', 'green', 'blue'].includes(powerUp.name)) {
      newPowerUps.red = false;
      newPowerUps.green = false;
      newPowerUps.blue = false;
    }
    newPowerUps[powerUp.name] = !powerUps[powerUp.name];
    console.log('SET', newPowerUps);
    setPowerUps(newPowerUps);
  };

  return (
    <div
      className={classNames('powerup', {
        active: powerUps[powerUp.name],
        locked: !owned && !challenge,
      })}
    >
      <img
        src={powerUp.imageUrl}
        alt="Nft"
        onClick={evt => {
          if (owned || challenge) {
            togglePowerUp();
          }
        }}
      />
      <span>{powerUp.name}</span>
    </div>
  );
};
