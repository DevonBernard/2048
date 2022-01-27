import React, { CSSProperties, useMemo } from 'react';
import clsx from 'clsx';

import {
  Animation,
  AnimationMerge,
  AnimationMove,
  AnimationNew,
  AnimationType,
} from '../types/Animations';
import { Direction } from '../types/Direction';
import { animationDuration, gridGap } from '../config';

const characterLibrary = {
  runes: {
    2: <span>&#5809;</span>,
    4: <span>&#5842;</span>,
    8: <span>&#5859;</span>,
    16: <span>&#5854;</span>,
    32: <span>&#5856;</span>,
    64: <span>&#5799;</span>,
    128: <span>&#5792;</span>,
    256: <span>&#5816;</span>,
    512: <span>&#5819;</span>,
    1024: <span>&#5857;</span>,
    2048: <span>&#5871;</span>,
    4096: <span>&#5871;</span>,
  },
};

export interface BoardTileProps {
  value: number;
  animations?: Animation[];
  charType?: string;
}

function tileTranslate(axis: 'X' | 'Y', value: number) {
  return `translate${axis}(calc(${value} * (${gridGap} + 100%))`;
}

function findAnimation<T extends Animation>(
  animations: Animation[] | undefined,
  type: AnimationType
): T {
  return animations?.find(animation => animation.type === type) as T;
}

const BoardTile: React.FC<BoardTileProps> = ({
  value,
  animations,
  charType,
}) => {
  const moveAnimation = useMemo(
    () => findAnimation<AnimationMove>(animations, AnimationType.MOVE),
    [animations]
  );
  const newAnimation = useMemo(
    () => findAnimation<AnimationNew>(animations, AnimationType.NEW),
    [animations]
  );
  const mergeAnimation = useMemo(
    () => findAnimation<AnimationMerge>(animations, AnimationType.MERGE),
    [animations]
  );

  const style = useMemo(() => {
    if (!moveAnimation) {
      return {};
    }

    const value: CSSProperties = {
      transition: animationDuration + 'ms ease-in-out all',
    };

    switch (moveAnimation.direction) {
      case Direction.UP:
        value.transform = tileTranslate('Y', -1 * moveAnimation.value);
        break;
      case Direction.DOWN:
        value.transform = tileTranslate('Y', moveAnimation.value);
        break;
      case Direction.LEFT:
        value.transform = tileTranslate('X', -1 * moveAnimation.value);
        break;
      case Direction.RIGHT:
        value.transform = tileTranslate('X', moveAnimation.value);
        break;
    }

    return value;
  }, [moveAnimation]);

  // @ts-ignore
  const charLib =
    charType in characterLibrary ? characterLibrary[charType] : false;
  const character = charLib && value in charLib ? charLib[value] : value;

  return (
    <div className="board-tile">
      {value !== 0 && (
        <div
          className={clsx('board-tile-value', 'board-tile-' + value, {
            'board-tile-new': !!newAnimation,
            'board-tile-merge': !!mergeAnimation,
          })}
          style={style}
        >
          {character}
        </div>
      )}
    </div>
  );
};

export default BoardTile;
