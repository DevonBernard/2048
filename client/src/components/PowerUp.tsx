import React from 'react';
import classNames from 'classnames';

export const PowerUp: any = ({
  owned,
  powerUp,
  powerUps,
  setPowerUps,
}: {
  owned: boolean;
  powerUp: any;
  powerUps: any;
  setPowerUps: any;
}) => {
  const togglePowerUp = () => {
    const newPowerUps = JSON.parse(JSON.stringify(powerUps));
    if (['red', 'green', 'blue'].includes(powerUp.name)) {
      newPowerUps.red = false;
      newPowerUps.green = false;
      newPowerUps.blue = false;
    }
    newPowerUps[powerUp.name] = !powerUps[powerUp.name];
    setPowerUps(newPowerUps);
  };

  return (
    <div
      className={classNames('powerup', {
        active: powerUps[powerUp.name],
        locked: !owned,
      })}
    >
      <img
        src={powerUp.imageUrl}
        alt="Nft"
        onClick={evt => {
          if (owned) {
            togglePowerUp();
          }
        }}
      />
      <span>{powerUp.name}</span>
    </div>
  );
};
