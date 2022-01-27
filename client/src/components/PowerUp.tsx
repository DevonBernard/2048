import React from 'react';
import classNames from 'classnames';

export const PowerUp: any = ({
  owned,
  powerUp,
  powerUps,
  setPowerUps,
  challenges,
  setChallenges,
  challenge = false,
}: {
  owned: boolean;
  powerUp: any;
  powerUps: any;
  setPowerUps: any;
  challenges: any;
  setChallenges: any;
  challenge?: boolean;
}) => {
  const togglePowerUp = () => {
    const newPowerUps = JSON.parse(JSON.stringify(powerUps));
    const newChallenges = JSON.parse(JSON.stringify(challenges));
    if (['red', 'green', 'blue'].includes(powerUp.name)) {
      newPowerUps.red = false;
      newPowerUps.green = false;
      newPowerUps.blue = false;
      newPowerUps[powerUp.name] = !powerUps[powerUp.name];
      setPowerUps(newPowerUps);
    }
    if (['invisible', 'runes'].includes(powerUp.name)) {
      newChallenges.invisible = false;
      newChallenges.runes = false;
      newChallenges[powerUp.name] = !challenges[powerUp.name];
      setChallenges(newChallenges);
    }
  };

  return (
    <div
      className={classNames('powerup', {
        active: powerUps[powerUp.name] || challenges[powerUp.name],
        locked: !owned && !challenge,
      })}
    >
      {challenge && owned && <div className="challenge-earned">&#9733;</div>}
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
