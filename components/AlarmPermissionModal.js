import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ExactAlarmPermissionModal({
  visible,
  onAllow,
  onCancel,
}) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Exact Alarm Required</Text>

          <Text style={styles.text}>
            UnBroken needs exact alarms to wake you up on time.
            Android requires you to allow this manually.
          </Text>

          <View style={styles.row}>
            <TouchableOpacity onPress={onCancel} style={styles.cancel}>
              <Text>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onAllow} style={styles.allow}>
              <Text style={{ color: '#fff' }}>Allow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancel: {
    padding: 10,
    marginRight: 10,
  },
  allow: {
    padding: 10,
    backgroundColor: '#d32f2f',
    borderRadius: 6,
  },
});
