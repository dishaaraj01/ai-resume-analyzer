import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getAuth,
} from "firebase/auth";

import { firebaseApp } from "./config";

export const auth = getAuth(firebaseApp);

export const registerUser = async (
  email: string,
  password: string
) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = async (
  email: string,
  password: string
) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  return await signOut(auth);
};

// Listen for login/logout changes
export const subscribeToAuthChanges = (
  callback: (user: any) => void
) => {
  return onAuthStateChanged(auth, callback);
};