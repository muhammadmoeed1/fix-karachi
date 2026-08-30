// =============================================================
//  firebase.js  —  (NOT USED YET - for the future live version)
// =============================================================
//  When you move from the demo to a real multi-user, real-time app,
//  paste your Firebase keys here and switch store.js over to Firestore.
//  Step-by-step guide: FIREBASE_SETUP.md
//
//  The example below is commented out and will not run as-is.
// =============================================================

/*
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_BUCKET',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
*/

export const FIREBASE_ENABLED = false
