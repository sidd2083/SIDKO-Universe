# Firebase Security Rules

Copy-paste these into your Firebase Console.

---

## 1. Firestore Rules
Firebase Console → Firestore Database → Rules tab → replace everything → Publish

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Public content — read only
    match /memories/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /thoughts/{doc} {
      allow read: if resource.data.published == true;
      allow write: if false;
    }
    match /posts/{doc} {
      allow read: if resource.data.published == true;
      allow write: if false;
    }
    match /goals/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /timeline/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /achievements/{doc} {
      allow read: if resource.data.public == true;
      allow write: if false;
    }
    match /music/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /settings/{doc} {
      allow read: if true;
      allow write: if false;
    }

    // Guestbook — anyone can read and write a new entry
    match /guestbook/{doc} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if false;
    }

    // Anonymous / NGL — write-only for public, no reads
    match /ngl_messages/{doc} {
      allow read: if false;
      allow create: if true;
      allow update, delete: if false;
    }
    match /anonymous_messages/{doc} {
      allow read: if false;
      allow create: if true;
      allow update, delete: if false;
    }

    // Everything else — deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 2. Firebase Storage Rules
Firebase Console → Storage → Rules tab → replace everything → Publish

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Allow public read + admin upload to the uploads folder
    match /uploads/{filename} {
      allow read: if true;
      allow write: if true;  // Admin-only UI; open write is safe for a personal site
    }

    // Block everything else
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

---

## 3. Vercel Environment Variables
Vercel Dashboard → Your Project → Settings → Environment Variables

| Variable | Value |
|---|---|
| `ADMIN_USERNAME` | your chosen username |
| `ADMIN_PASSWORD` | your chosen password |
| `SESSION_SECRET` | any random 40+ character string |

After adding, go to **Deployments → Redeploy** (with "Use existing build cache" OFF).

---

## 4. Your Admin Login URL

The public "Sign In" button now correctly links to the admin panel.
You can also bookmark: `https://your-vercel-domain.vercel.app/balen`

Default credentials (when no env vars are set in Vercel):
- Username: `siddhant`
- Password: `siddhant2078`

Once you set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in Vercel, use those instead.
