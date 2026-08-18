import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyB39u1-5EbGimA--fZa_-FApAavayzjlBU',
  authDomain: 'stayunknown-auth.firebaseapp.com',
  projectId: 'stayunknown-auth',
  storageBucket: 'stayunknown-auth.firebasestorage.app',
  messagingSenderId: '453624121758',
  appId: '1:453624121758:web:79f2f96bc416b0fdfc4ae8f',
};

const app = initializeApp(firebaseConfig);

let auth;

if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth, onAuthStateChanged };
export type { User };

export async function createAccount(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  return signOut(auth);
}

export async function getStoredAuthUser(): Promise<User | null> {
  const stored = await AsyncStorage.getItem('stayunknown_auth_user');
  return stored ? (JSON.parse(stored) as User) : null;
}
