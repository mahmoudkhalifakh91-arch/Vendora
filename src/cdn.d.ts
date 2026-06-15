// Safe wildcard declarations for Firebase CDN modules used in the Waslha app
declare module 'https://*' {
  const content: any;
  export default content;

  // App / Core
  export const initializeApp: any;

  // Auth
  export const getAuth: any;
  export const onAuthStateChanged: any;
  export const signOut: any;
  export const signInWithEmailAndPassword: any;
  export const signInWithPopup: any;
  export const createUserWithEmailAndPassword: any;
  export const GoogleAuthProvider: any;

  // Firestore
  export const getFirestore: any;
  export const initializeFirestore: any;
  export const persistentLocalCache: any;
  export const persistentMultipleTabManager: any;
  export const doc: any;
  export const getDoc: any;
  export const getDocs: any;
  export const collection: any;
  export const query: any;
  export const where: any;
  export const onSnapshot: any;
  export const addDoc: any;
  export const setDoc: any;
  export const updateDoc: any;
  export const deleteDoc: any;
  export const limit: any;
  export const writeBatch: any;
  export const orderBy: any;
  export const increment: any;
  export const arrayUnion: any;
  export const arrayRemove: any;
  export const deleteField: any;

  // Cloud Messaging
  export const getMessaging: any;
  export const getToken: any;
  export const onMessage: any;
}
