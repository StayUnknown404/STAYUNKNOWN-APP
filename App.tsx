import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Home from './screens/Home';
import CreateProfile from './screens/CreateProfile';
import { auth, onAuthStateChanged, User } from './services/firebase';
import { registerForPushNotificationsAsync } from './services/pushNotifications';

type EntryView = 'welcome' | 'profile' | 'store';

export default function App() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [entryView, setEntryView] = useState<EntryView>(auth.currentUser ? 'store' : 'welcome');

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, currentUser => {
    setUser(currentUser);
    setReady(true);

    if (currentUser) {
      setEntryView('store');

      registerForPushNotificationsAsync().catch(error => {
        console.warn('Push notification registration failed:', error);
      });
    }
  });

  return unsubscribe;
}, []);

  if (!ready) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color="#fff" />
      </SafeAreaView>
    );
  }

  if (user || entryView === 'store') return <Home />;

  if (entryView === 'profile') {
    return (
      <CreateProfile
        onComplete={() => setEntryView('store')}
        onSkip={() => setEntryView('store')}
      />
    );
  }

  return (
    <Welcome
      onStart={() => setEntryView('profile')}
      onGuest={() => setEntryView('store')}
    />
  );
}

function Welcome({ onStart, onGuest }: { onStart: () => void; onGuest: () => void }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.welcome}>
        <Text style={styles.brand}>STAYUNKNOWN</Text>

        <View>
          <Text style={styles.title}>WELCOME TO THE APP</Text>
          <Text style={styles.subtitle}>Move in silence. Stay unknown.</Text>
        </View>

        <View>
          <Pressable style={styles.button} onPress={onStart}>
            <Text style={styles.buttonText}>GET STARTED</Text>
          </Pressable>
          <Pressable style={styles.guest} onPress={onGuest}>
            <Text style={styles.guestText}>CONTINUE AS GUEST</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  welcome: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 80,
    paddingBottom: 35,
  },
  brand: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 3,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#888',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  guest: {
    alignItems: 'center',
    padding: 16,
  },
  guestText: {
    color: '#888',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
