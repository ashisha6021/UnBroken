// games/OrderChaos.js
import React, { useState, useMemo } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

import GameContainer from '../GameContainer';
import GameTimer from '../GameTimer';
import useGameTimer from '../useGameTimer';
import useAntiForceClose from '../useAntiForceClose';
import { GAME_CONFIG } from '../gameConfig';
import { shuffle, uniqueRandomNumbers } from './helpers';

import { triggerFail, triggerSuccess } from '../BrainGameController';
import {completeAlarm} from '../alarmCompletion'

const GAME_TYPE = 'ORDER_CHAOS';

export default function OrderChaos({ route }) {
  useAntiForceClose();

  const alarmId = route?.params?.alarmId;
  if (!alarmId) return null;

  const config = GAME_CONFIG[GAME_TYPE];
  const [tries, setTries] = useState(0);
  const [index, setIndex] = useState(0);

  const numbers = useMemo(
    () => shuffle(uniqueRandomNumbers(4, 1, 9)),
    []
  );

  const sorted = useMemo(
    () => [...numbers].sort((a, b) => a - b),
    [numbers]
  );

  const timeLeft = useGameTimer(config.timeLimit, onFail);

  function onSuccess() {
  triggerSuccess(); // DO NOT navigate
}

  function onFail() {
  setTries(prev => {
    const next = prev + 1;

    if (next >= config.maxTries) {
      triggerFail(GAME_TYPE);
    }

    return next;
  });
}


  return (
    <GameContainer>
      <GameTimer timeLeft={timeLeft} />

      <Text style={styles.title}>Tap in ascending order</Text>

      {numbers.map(n => (
        <TouchableOpacity
          key={`num-${n}`}
          style={styles.option}
          onPress={() => {
            if (n === sorted[index]) {
              index + 1 === sorted.length
                ? onSuccess()
                : setIndex(i => i + 1);
            } else {
              onFail();
            }
          }}
        >
          <Text style={styles.optionText}>{n}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.tries}>
        Tries left: {config.maxTries - tries}
      </Text>
    </GameContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  option: {
    backgroundColor: '#ffd60a',
    paddingVertical: 20,
    borderRadius: 50,
    marginVertical: 8,
  },
  optionText: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    color: '#000',
  },
  tries: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 14,
  },
});
