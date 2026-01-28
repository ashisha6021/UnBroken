// brain-games/GameTimer.js
import React from 'react';
import { Text, StyleSheet } from 'react-native';

export default function GameTimer({ timeLeft }) {
  return (
    <Text
      style={[
        styles.timer,
        timeLeft <= 3 && styles.danger,
      ]}
    >
      ⏱ {timeLeft}s
    </Text>
  );
}

const styles = StyleSheet.create({
  timer: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    color: '#ffd60a',
  },
  danger: {
    color: '#ff3b30',
    transform: [{ scale: 1.1 }],
  },
});
