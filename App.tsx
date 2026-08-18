import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import CreateProfile from './screens/CreateProfile';
import Home from './screens/Home';
type Screen = 'welcome' | 'profile' | 'home';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');

  if (screen === 'profile') {
    return (
      <CreateProfile
        onComplete={() => setScreen('home')}
        onSkip={() => setScreen('home')}
      />
    );
  }

if (screen === 'home') {
  return <Home />;
}
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.home}>
          <Text style={styles.brand}>STAYUNKNOWN</Text>
          <Text style={styles.homeTitle}>WELCOME HOME</Text>
          <Text style={styles.homeSubtitle}>
            Your STAYUNKNOWN experience starts here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.welcome}>
        <Text style={styles.brand}>STAYUNKNOWN</Text>

        <View>
          <Text style={styles.title}>WELCOME TO THE APP</Text>
          <Text style={styles.subtitle}>
            Move in silence. Stay unknown.
          </Text>
        </View>

        <Pressable
          style={styles.button}
          onPress={() => setScreen('profile')}
        >
          <Text style={styles.buttonText}>GET STARTED</Text>
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
  welcome: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 40,
  },
  home: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  brand: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 16,
    lineHeight: 24,
  },
  homeTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 12,
  },
  homeSubtitle: {
    color: '#aaa',
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 17,
  },
  buttonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
