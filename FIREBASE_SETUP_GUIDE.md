# Firebase Setup & Configuration Guide

## Overview

This guide walks you through setting up Firebase for the BarbrickDesign applications. Firebase provides authentication, real-time database, cloud storage, and hosting services that power several applications in this repository.

## 🔑 What You'll Need

- A Google account (free)
- Firebase project (free tier available)
- Basic understanding of web development
- Environment configuration

## 📋 Firebase Services Used

The BarbrickDesign ecosystem uses the following Firebase services:

1. **Firebase Authentication** - User login and identity management
2. **Cloud Firestore** - Real-time NoSQL database
3. **Cloud Storage** - File and media storage
4. **Firebase Hosting** - Static web hosting (optional)
5. **Cloud Functions** - Serverless backend logic (optional)

## 🚀 Step 1: Create Firebase Project

### 1.1 Access Firebase Console

1. **Visit Firebase Console**
   ```
   https://console.firebase.google.com/
   ```

2. **Sign In**
   - Use your Google account
   - Accept terms of service if first time

### 1.2 Create New Project

1. **Click "Add Project" or "Create a Project"**

2. **Enter Project Details**
   - **Project Name**: Choose a descriptive name
     - Example: `barbrickdesign-production`
     - Example: `my-barbrick-app`
   - Click "Continue"

3. **Google Analytics** (Optional but Recommended)
   - Enable Google Analytics: Toggle ON
   - Select or create Analytics account
   - Accept terms
   - Click "Create Project"

4. **Wait for Setup**
   - Firebase creates your project
   - This usually takes 30-60 seconds
   - Click "Continue" when ready

## 🔧 Step 2: Configure Firebase Services

### 2.1 Enable Authentication

1. **Navigate to Authentication**
   - In Firebase Console, click "Authentication" in left sidebar
   - Click "Get Started"

2. **Enable Sign-In Methods**
   - Click "Sign-in method" tab
   - Enable desired providers:

   **Email/Password:**
   - Click "Email/Password"
   - Toggle "Enable"
   - Click "Save"

   **Google Sign-In:**
   - Click "Google"
   - Toggle "Enable"
   - Enter support email
   - Click "Save"

   **Other Providers** (Optional):
   - Facebook, GitHub, Twitter, etc.
   - Follow provider-specific setup

3. **Configure Authorized Domains**
   - Click "Settings" tab
   - Scroll to "Authorized domains"
   - Add your domains:
     ```
     localhost
     barbrickdesign.github.io
     your-custom-domain.com
     ```

### 2.2 Set Up Cloud Firestore

1. **Navigate to Firestore Database**
   - Click "Firestore Database" in left sidebar
   - Click "Create database"

2. **Choose Security Mode**
   - **Production Mode**: Secure by default (recommended)
   - **Test Mode**: Open access (only for development)
   - Select "Production mode"
   - Click "Next"

3. **Select Location**
   - Choose closest region to your users
   - Example: `us-central1`, `us-east1`, `europe-west1`
   - Note: This cannot be changed later
   - Click "Enable"

4. **Set Up Security Rules**
   - Click "Rules" tab
   - Replace with production-ready rules:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // User profile data
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       
       // R3Link game state
       match /r3link/{playerId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == playerId;
       }
       
       // Shared data (read-only)
       match /public/{document=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       
       // Admin-only collections
       match /admin/{document=**} {
         allow read, write: if request.auth != null && 
           request.auth.token.admin == true;
       }
     }
   }
   ```

5. **Publish Rules**
   - Click "Publish"
   - Rules take effect immediately

### 2.3 Configure Cloud Storage

1. **Navigate to Storage**
   - Click "Storage" in left sidebar
   - Click "Get Started"

2. **Set Security Rules**
   - Choose "Production mode"
   - Click "Next"

3. **Choose Location**
   - Use same location as Firestore
   - Click "Done"

4. **Configure CORS** (for web uploads)
   - Create `cors.json`:
   ```json
   [
     {
       "origin": ["https://barbrickdesign.github.io", "http://localhost:*"],
       "method": ["GET", "POST", "PUT", "DELETE"],
       "maxAgeSeconds": 3600
     }
   ]
   ```

   - Install Google Cloud SDK if needed
   - Apply CORS configuration:
   ```bash
   gsutil cors set cors.json gs://your-project-id.appspot.com
   ```

5. **Set Storage Rules**
   - Click "Rules" tab
   - Configure access:

   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       // User uploads
       match /users/{userId}/{allPaths=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && 
           request.auth.uid == userId &&
           request.resource.size < 5 * 1024 * 1024; // 5MB limit
       }
       
       // Public assets
       match /public/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

### 2.4 Create Firestore Collections

1. **Navigate to Firestore Database**
   - Click "Data" tab

2. **Create Required Collections**
   - Click "Start collection"
   - Create these collections:

   **Collection: `users`**
   ```
   Document ID: auto-generated
   Fields:
   - email: string
   - displayName: string
   - createdAt: timestamp
   - lastLogin: timestamp
   ```

   **Collection: `r3link`**
   ```
   Document ID: user UID
   Fields:
   - level: number
   - points: number
   - vaultStake: number
   - achievements: array
   - lastUpdated: timestamp
   ```

   **Collection: `contributions`**
   ```
   Document ID: auto-generated
   Fields:
   - userId: string
   - type: string (api_key, compute, storage)
   - service: string
   - pointsEarned: number
   - timestamp: timestamp
   ```

   **Collection: `api_pool`**
   ```
   Document ID: auto-generated
   Fields:
   - service: string
   - keyId: string (hashed)
   - contributorId: string
   - usageCount: number
   - pointsGenerated: number
   - status: string
   - lastUsed: timestamp
   ```

## 🎨 Step 3: Get Firebase Configuration

### 3.1 Add Web App to Firebase

1. **Navigate to Project Settings**
   - Click gear icon ⚙️ next to "Project Overview"
   - Click "Project settings"

2. **Add Web App**
   - Scroll to "Your apps" section
   - Click web icon `</>`
   - Enter app nickname: "BarbrickDesign Web App"
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

3. **Copy Firebase Config**
   - Firebase will display your config object
   - Copy the configuration values:

   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123",
     measurementId: "G-ABC123XYZ"
   };
   ```

   - Click "Continue to console"

### 3.2 Add Configuration to Environment

1. **Update .env File**
   ```bash
   # Copy template if needed
   cp .env.example .env
   
   # Edit file
   nano .env
   ```

2. **Add Firebase Values**
   ```env
   # Firebase Configuration
   FIREBASE_API_KEY=AIzaSy...your-actual-api-key
   FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=123456789
   FIREBASE_APP_ID=1:123456789:web:abc123
   FIREBASE_MEASUREMENT_ID=G-ABC123XYZ
   ```

3. **Secure Your Environment File**
   ```bash
   # Set restrictive permissions
   chmod 600 .env
   
   # Verify it's in .gitignore
   grep "^\.env$" .gitignore
   ```

## 📱 Step 4: Integrate Firebase in Applications

### 4.1 Using Firebase SDK (Modern Approach)

**Add Firebase SDK via CDN:**

```html
<!-- Firebase App (core) -->
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>

<!-- Firebase services you want to use -->
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-storage-compat.js"></script>
```

**Initialize Firebase:**

```javascript
// Firebase configuration from environment
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get service instances
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
```

### 4.2 Example: User Authentication

```javascript
// Sign up new user
async function signUpUser(email, password) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    await db.collection('users').doc(user.uid).set({
      email: user.email,
      displayName: user.displayName || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('User created:', user.uid);
    return user;
  } catch (error) {
    console.error('Sign up error:', error.message);
    throw error;
  }
}

// Sign in existing user
async function signInUser(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Update last login
    await db.collection('users').doc(user.uid).update({
      lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('User signed in:', user.uid);
    return user;
  } catch (error) {
    console.error('Sign in error:', error.message);
    throw error;
  }
}

// Sign in with Google
async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    
    // Create or update user profile
    await db.collection('users').doc(user.uid).set({
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    return user;
  } catch (error) {
    console.error('Google sign in error:', error.message);
    throw error;
  }
}

// Sign out
async function signOutUser() {
  try {
    await auth.signOut();
    console.log('User signed out');
  } catch (error) {
    console.error('Sign out error:', error.message);
    throw error;
  }
}

// Listen for auth state changes
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User is signed in:', user.uid);
    // Load user data, show authenticated UI
  } else {
    console.log('User is signed out');
    // Show login UI
  }
});
```

### 4.3 Example: Firestore Operations

```javascript
// Create document
async function createDocument(collection, data) {
  try {
    const docRef = await db.collection(collection).add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('Document created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Create error:', error);
    throw error;
  }
}

// Read document
async function getDocument(collection, docId) {
  try {
    const doc = await db.collection(collection).doc(docId).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    } else {
      console.log('Document not found');
      return null;
    }
  } catch (error) {
    console.error('Read error:', error);
    throw error;
  }
}

// Update document
async function updateDocument(collection, docId, data) {
  try {
    await db.collection(collection).doc(docId).update({
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('Document updated');
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
}

// Delete document
async function deleteDocument(collection, docId) {
  try {
    await db.collection(collection).doc(docId).delete();
    console.log('Document deleted');
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
}

// Query collection
async function queryCollection(collection, field, operator, value) {
  try {
    const querySnapshot = await db.collection(collection)
      .where(field, operator, value)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return documents;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Real-time listener
function listenToDocument(collection, docId, callback) {
  return db.collection(collection).doc(docId).onSnapshot((doc) => {
    if (doc.exists) {
      callback({ id: doc.id, ...doc.data() });
    }
  }, (error) => {
    console.error('Listen error:', error);
  });
}
```

### 4.4 Example: File Upload to Storage

```javascript
// Upload file
async function uploadFile(file, path) {
  try {
    const storageRef = storage.ref();
    const fileRef = storageRef.child(path);
    
    // Upload file
    const snapshot = await fileRef.put(file);
    
    // Get download URL
    const downloadURL = await snapshot.ref.getDownloadURL();
    
    console.log('File uploaded:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Upload with progress tracking
function uploadFileWithProgress(file, path, onProgress) {
  return new Promise((resolve, reject) => {
    const storageRef = storage.ref();
    const fileRef = storageRef.child(path);
    const uploadTask = fileRef.put(file);
    
    uploadTask.on('state_changed',
      (snapshot) => {
        // Progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        // Error
        console.error('Upload error:', error);
        reject(error);
      },
      async () => {
        // Complete
        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
        resolve(downloadURL);
      }
    );
  });
}

// Delete file
async function deleteFile(path) {
  try {
    const storageRef = storage.ref();
    const fileRef = storageRef.child(path);
    await fileRef.delete();
    console.log('File deleted');
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
}
```

## 💰 Step 5: Contribute Firebase Resources to Pool (Optional)

### Why Contribute?

Share your Firebase resources with the community and earn rewards:

1. **Share Project**: Contribute Firebase project credentials
2. **Earn Points**: Get points when others use your Firebase resources
3. **Fair Usage**: Usage is monitored and rate-limited
4. **Community Growth**: Help scale the BarbrickDesign ecosystem

### Security Considerations

⚠️ **Important**: Only contribute Firebase projects that:
- Are dedicated to BarbrickDesign applications
- Have appropriate security rules configured
- Monitor usage and costs
- Have usage limits set up

**DO NOT contribute:**
- Production projects with sensitive data
- Projects shared with other applications
- Projects without proper security rules

### Adding to Contribution Portal

1. **Visit Contribution Portal**
   ```
   https://barbrickdesign.github.io/contribution-portal.html
   ```

2. **Navigate to Firebase Section**
   - Scroll to "Cloud Services" section
   - Click "Contribute Firebase Project"

3. **Enter Configuration**
   - Paste your Firebase configuration object
   - Set usage limits (queries per day, storage limit)
   - Configure point rates
   - Review security checklist

4. **Submit Contribution**
   - Click "Contribute Firebase Config"
   - Credentials are encrypted before storage
   - Start earning points immediately

### Contribution Rewards

- **Database Queries**: 2 points per 100 reads
- **Storage Usage**: 5 points per GB/month
- **Authentication**: 1 point per login
- **Functions Execution**: 3 points per 1000 invocations
- **Consistency Bonus**: 2x multiplier for 30+ days uptime
- **High Availability**: 1.5x multiplier for 99%+ uptime

See [API_POOL_SYSTEM_README.md](API_POOL_SYSTEM_README.md) for complete details.

## 📊 Step 6: Monitor Usage & Costs

### Firebase Console Monitoring

1. **View Usage Dashboard**
   - In Firebase Console, click "Usage and billing"
   - Monitor Spark (free) plan limits:
     - Firestore: 50K reads/day, 20K writes/day
     - Storage: 1 GB, 10 GB transfer/day
     - Auth: Unlimited
     - Hosting: 10 GB/month

2. **Set Budget Alerts**
   - If on Blaze plan (pay-as-you-go)
   - Set budget alerts in Google Cloud Console
   - Recommended: Alert at 50%, 80%, 100% of budget

3. **Monitor Security**
   - Review authentication logs
   - Check for unusual activity
   - Monitor failed security rule evaluations

### Optimize Costs

**Firestore Optimization:**
```javascript
// Use compound indexes for complex queries
// Enable offline persistence to reduce reads
db.enablePersistence()
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.log('Multiple tabs open');
    } else if (err.code == 'unimplemented') {
      console.log('Browser doesn\'t support persistence');
    }
  });

// Batch operations to reduce writes
const batch = db.batch();
batch.set(doc1Ref, data1);
batch.update(doc2Ref, data2);
batch.delete(doc3Ref);
await batch.commit();
```

**Storage Optimization:**
```javascript
// Compress images before upload
// Use appropriate file formats
// Implement CDN for static assets
// Delete unused files regularly
```

## 🔒 Security Best Practices

### 1. Environment Variables

- ✅ Store config in `.env` file
- ✅ Add `.env` to `.gitignore`
- ✅ Never commit Firebase config to public repos
- ✅ Use different projects for dev/staging/prod
- ❌ Never hardcode credentials in source code

### 2. Security Rules

- ✅ Use production mode by default
- ✅ Require authentication for sensitive data
- ✅ Validate data types and structure
- ✅ Limit query results
- ✅ Test security rules thoroughly

### 3. API Key Restrictions

1. **In Firebase Console**
   - Go to Google Cloud Console
   - Navigate to "APIs & Services" → "Credentials"
   - Click your API key

2. **Set Application Restrictions**
   - HTTP referrers:
     ```
     https://barbrickdesign.github.io/*
     http://localhost:*
     ```

3. **Restrict API Access**
   - Enable only:
     - Identity Toolkit API
     - Cloud Firestore API
     - Cloud Storage API

### 4. Authentication Security

```javascript
// Enforce email verification
user.sendEmailVerification();

// Implement password requirements
// Minimum 8 characters, must include numbers and symbols

// Add reCAPTCHA for sign-up
// Prevent automated account creation

// Implement rate limiting
// Prevent brute force attacks

// Use Firebase App Check
// Protect backend resources from abuse
```

## 🐛 Troubleshooting

### Common Issues

**Issue: "Firebase not defined"**
- Solution: Ensure Firebase SDK scripts load before your code
- Check script tags order in HTML
- Verify CDN URLs are correct

**Issue: "Permission denied"**
- Solution: Check Firestore security rules
- Verify user is authenticated
- Ensure user has necessary permissions

**Issue: "Storage CORS error"**
- Solution: Configure CORS settings
- Add your domain to authorized origins
- Use `gsutil` to apply CORS config

**Issue: "Quota exceeded"**
- Solution: Monitor usage dashboard
- Optimize queries and caching
- Consider upgrading to Blaze plan
- Implement rate limiting

**Issue: "Authentication popup blocked"**
- Solution: User must allow popups
- Use `signInWithRedirect()` instead
- Inform users to enable popups

### Getting Help

- **Firebase Docs**: https://firebase.google.com/docs
- **Stack Overflow**: Tag with `firebase`
- **Firebase Support**: Console → Support tab
- **Community**: Join Discord for help

## 🧪 Testing Your Setup

### Test Authentication

```javascript
// Test sign up
await signUpUser('test@example.com', 'SecurePassword123!');

// Test sign in
await signInUser('test@example.com', 'SecurePassword123!');

// Test Google sign in
await signInWithGoogle();

// Test sign out
await signOutUser();
```

### Test Firestore

```javascript
// Test create
const docId = await createDocument('test', { message: 'Hello Firebase' });

// Test read
const doc = await getDocument('test', docId);
console.log(doc);

// Test update
await updateDocument('test', docId, { message: 'Updated message' });

// Test delete
await deleteDocument('test', docId);
```

### Test Storage

```javascript
// Test upload
const file = document.getElementById('fileInput').files[0];
const url = await uploadFile(file, `test/${file.name}`);
console.log('File URL:', url);

// Test delete
await deleteFile(`test/${file.name}`);
```

## 📚 Additional Resources

### Official Documentation

- **Firebase Docs**: https://firebase.google.com/docs
- **Authentication Guide**: https://firebase.google.com/docs/auth
- **Firestore Guide**: https://firebase.google.com/docs/firestore
- **Storage Guide**: https://firebase.google.com/docs/storage

### Related Guides

- [NAMUS_API_SETUP_GUIDE.md](NAMUS_API_SETUP_GUIDE.md) - NamUs API setup
- [API_POOL_SYSTEM_README.md](API_POOL_SYSTEM_README.md) - Contribution system
- [DEV_CONTRIBUTION_REWARDS.md](DEV_CONTRIBUTION_REWARDS.md) - Developer rewards

### Video Tutorials

- Firebase Getting Started: https://firebase.google.com/codelabs
- Firebase YouTube Channel: https://www.youtube.com/firebase

## 🎉 Next Steps

After completing this setup:

1. ✅ Test Firebase authentication
2. ✅ Create Firestore collections
3. ✅ Test data operations
4. ✅ Configure security rules
5. ✅ Monitor usage and costs
6. ✅ Consider contributing to resource pool
7. ✅ Review security best practices
8. ✅ Join the community on Discord

## 📞 Support

For questions or issues:

- **Email**: support@barbrickdesign.com
- **GitHub Issues**: https://github.com/barbrickdesign/barbrickdesign.github.io/issues
- **Discord**: https://discord.gg/M4QZyPQq
- **Firebase Support**: https://firebase.google.com/support

---

**Built with ❤️ for the BarbrickDesign community**

Scale your applications with Firebase! 🚀
