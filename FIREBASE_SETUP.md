# Firebase Authentication Setup Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "cooked-app")
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable the following providers:

### Email/Password
- Click "Email/Password"
- Enable "Email/Password" and "Email link (passwordless sign-in)" if desired
- Click "Save"

### Google OAuth
- Click "Google"
- Enable the provider
- Add your project's support email
- Click "Save"

### GitHub OAuth
- Click "GitHub"
- Enable the provider
- You'll need to create a GitHub OAuth App:
  - Go to GitHub Settings > Developer settings > OAuth Apps
  - Click "New OAuth App"
  - Set Authorization callback URL to: `https://your-project-id.firebaseapp.com/__/auth/handler`
  - Copy the Client ID and Client Secret to Firebase
- Click "Save"

## 3. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web" icon (`</>`)
4. Register your app with a nickname (e.g., "cooked-web")
5. Copy the Firebase configuration object

## 4. Update Your App Configuration

Replace the placeholder values in `src/firebase.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 5. Set Up Authorized Domains

1. In Firebase Console, go to Authentication > Settings
2. Add your development domain: `localhost`
3. Add your production domain when you deploy

## 6. Test the Setup

1. Start your development server: `npm start`
2. Navigate to your app
3. Click "Sign In" button
4. Try creating an account with email/password
5. Test Google and GitHub sign-in (if configured)

## 7. Security Rules (Optional)

For Firestore (if you plan to use it):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Recipes can be read by authenticated users
    match /recipes/{recipeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## 8. Environment Variables (Recommended)

Create a `.env` file in your project root:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

Then update `src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
```

## Features Included

✅ **Email/Password Authentication**
- Sign up with email and password
- Sign in with email and password
- Password reset functionality

✅ **OAuth Providers**
- Google Sign-In
- GitHub Sign-In

✅ **Session Management**
- Automatic login persistence
- Secure logout
- User profile management

✅ **UI Components**
- Beautiful login/signup forms
- User profile page
- Navigation integration
- Responsive design

✅ **Security Features**
- Input validation
- Error handling
- Secure authentication flow

## Next Steps

1. Complete the Firebase project setup above
2. Update the configuration in `src/firebase.js`
3. Test all authentication features
4. Customize the UI to match your app's design
5. Add user-specific features (e.g., personal recipe collections)

