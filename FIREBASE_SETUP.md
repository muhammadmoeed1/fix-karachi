# Firebase Setup (Future Step — not required for the demo)

The app currently runs in **demo mode** (data in the browser's localStorage).
Follow these steps when you want a real multi-user, real-time version.

## 1. Create a Firebase project
1. Go to https://console.firebase.google.com (free).
2. Click "Add project" and give it a name (e.g. `fix-karachi`).
3. Add a **Web app** (the `</>` icon).
4. Copy the generated `firebaseConfig` object (apiKey, projectId, etc.).

## 2. Install Firebase
```bash
npm install firebase
```

## 3. Add your keys
Open `src/services/firebase.js`, uncomment the example code, and paste your
`firebaseConfig` values.

## 4. Enable services (Firebase console)
- **Authentication** → enable Email/Password
- **Firestore Database** → Create database (start in test mode)
- **Storage** → for photos (optional)

## 5. Point store.js at Firestore
Replace the localStorage line in each `store.js` function with a Firestore call:

```js
// before (demo):
export const getReports = () => read(REPORTS_KEY, [])

// after (Firebase):
import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase.js'
export const getReports = async () => {
  const snap = await getDocs(collection(db, 'reports'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
```

> Firebase calls are async, so add `await` where they are used in AppContext.

## 6. Real-time updates (the highlight for judges)
Use `onSnapshot` so reports update live without a refresh:

```js
import { onSnapshot, collection } from 'firebase/firestore'
onSnapshot(collection(db, 'reports'), (snap) => {
  setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
})
```

The rest of the UI stays exactly the same.
