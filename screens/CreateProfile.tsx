import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';

type CreateProfileProps = {
  onComplete: () => void;
  onSkip: () => void;
};

export default function CreateProfile({
  onComplete,
  onSkip,
}: CreateProfileProps) {
  const [username, setUsername] = useState('');

  const canContinue = username.trim().length >= 3;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brand}>STAYUNKNOWN</Text>

        <Text style={styles.title}>CREATE YOUR PROFILE</Text>

        <Text style={styles.subtitle}>
          Choose a username and make STAYUNKNOWN yours.
        </Text>

        <Text style={styles.label}>USERNAME</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter username"
          placeholderTextColor="#777"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Pressable
          style={[styles.primaryButton, !canContinue && styles.disabledButton]}
          onPress={onComplete}
          disabled={!canContinue}
        >
          <Text style={styles.primaryText}>CREATE PROFILE</Text>
        </Pressable>

        <Pressable style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>SKIP FOR NOW</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  brand: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 48,
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 36,
  },
  label: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 16,
  },
  disabledButton: {
    opacity: 0.45,
  },
  primaryText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  skipText: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
});