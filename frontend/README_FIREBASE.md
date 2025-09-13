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

Capacitor (native) Google Sign-In
- This app uses native Google Sign-In on iOS/Android to avoid CORS/popup issues.
- Env vars: add optional Google client IDs to `.env.local`:
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (Web client ID)
  - `NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID` (iOS OAuth client)
  - `NEXT_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` (Android OAuth client)
- iOS setup:
  - Download `GoogleService-Info.plist` from Firebase Console and add it to `ios/App/App` in Xcode.
  - In the iOS target, add a URL Type using the `REVERSED_CLIENT_ID` from the plist.
  - Run `npx cap sync ios` and rebuild.
- Android setup:
  - Add `google-services.json` to the Android project (once Android is added).
  - Ensure the OAuth client in Google Cloud has the correct SHA-1/256.
