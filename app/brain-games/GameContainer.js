// brain-games/GameContainer.js
import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function GameContainer({ children }) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0b',
    padding: 24,
    justifyContent: 'space-between',
  },
});
