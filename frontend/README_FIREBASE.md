Firebase Setup

Environment variables (create `.env.local` in `frontend/`):

- NEXT_PUBLIC_FIREBASE_API_KEY=
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
- NEXT_PUBLIC_FIREBASE_PROJECT_ID=
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
- NEXT_PUBLIC_FIREBASE_APP_ID=

Auth
- Enable Google, Email/Password, and Anonymous providers in Firebase Console > Authentication.

Email/Password UX
- The sign-in screen supports sign in, sign up, and password reset.

Firestore
- Create database in production or test mode.
- Data layout used by the app:
  - `users/{uid}/todos/{todoId}`
  - `users/{uid}/lists/{listId}`
  - `users/{uid}/routines/{routineId}`
  - `users/{uid}/profile/main` (profile doc)
  - `users/{uid}/metrics/current` (current score)
  - `users/{uid}/metrics/current/history/{entryId}` (history entries)
- Security rules should restrict access to authenticated users:

  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }

Offline
- Firestore persistence is enabled with multi-tab support. Data queues while offline and syncs when online.
