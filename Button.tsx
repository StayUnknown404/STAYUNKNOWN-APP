import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ButtonProps = {
  title: string;
  onPress?: () => void;
};

export const Button = ({ title, onPress }: ButtonProps) => {
  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.text}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
  },
});
