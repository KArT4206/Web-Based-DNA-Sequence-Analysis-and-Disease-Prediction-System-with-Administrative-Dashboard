import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  deleteDoc,
  limit,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: ".....",
  authDomain: "........",
  projectId: ".......",
  storageBucket: ".........",
  messagingSenderId: ".......",
  appId: "....."
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export {
  onAuthStateChanged,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fbSignOut as signOut,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  ref,
  uploadBytesResumable,
  deleteDoc,
  getDownloadURL,
};

// ✅ Role checker
export async function getUserRole(uid) {
  if (!uid) return null;
  const refUser = doc(db, "users", uid);
  const snap = await getDoc(refUser);
  if (snap.exists()) return snap.data().role || "user";
  return "user";
}
