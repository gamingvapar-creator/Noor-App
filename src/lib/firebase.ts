import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc 
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";

const firebaseConfig = {
  projectId: "handy-processor-k94fq",
  appId: "1:625132273929:web:25f408d3ce28f7bbccd3d8",
  apiKey: "AIzaSyAmGlrYgSoZHj7IQjOQhLDnVDIOzSxeuLw",
  authDomain: "handy-processor-k94fq.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-6ec3eb68-a9ea-4708-ae56-3dc06d7ad144",
  storageBucket: "handy-processor-k94fq.firebasestorage.app",
  messagingSenderId: "625132273929"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Provider
const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Google Sign In Error:", error);
    throw error;
  }
}

export async function logoutUser() {
  await signOut(auth);
}

// User Sync functions
export async function saveUserProgressToCloud(email: string, data: any) {
  if (!email || email === "guest") return;
  try {
    const safeDocId = email.replace(/[.$#[\]]/g, "_");
    const userDocRef = doc(db, "users", safeDocId);
    await setDoc(userDocRef, {
      email,
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log("Saved user progress to cloud for:", email);
  } catch (e) {
    console.error("Error saving user progress:", e);
  }
}

export async function getUserProgressFromCloud(email: string) {
  if (!email || email === "guest") return null;
  try {
    const safeDocId = email.replace(/[.$#[\]]/g, "_");
    const userDocRef = doc(db, "users", safeDocId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (e) {
    console.error("Error fetching user progress:", e);
  }
  return null;
}
