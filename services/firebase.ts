import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyB39u1-5EbGimA--fZa_-FApAavayzjlBU',
  authDomain: 'stayunknown-auth.firebaseapp.com',
  projectId: 'stayunknown-auth',
  storageBucket: 'stayunknown-auth.firebasestorage.app',
  messagingSenderId: '453624121758',
  appId: '1:453624121758:web:79f2f96bc46b0fdfc4ae8f',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export async function createAccount(
  email: string,
  password: string
) {
  return createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
}

export async function login(
  email: string,
  password: string
) {
  return signInWithEmailAndPassword(
    auth,
    email,
    password
  );
}

export async function logout() {
  return signOut(auth);
}
