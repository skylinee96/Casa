# Casa

Casa is a phone-first progressive web app for a shared budget, plans and task lists. It works immediately in one browser; shared live updates need the short Firebase setup below.

## Run it locally

Open `index.html` in a browser for a private preview. For the install and invitation buttons to work reliably, publish the `app` folder on any static web host that serves HTTPS (Firebase Hosting, Netlify or GitHub Pages).

On an iPhone, open the published address in Safari, tap **Share**, then choose **Add to Home Screen**. On Android, open it in Chrome and choose **Install app** or **Add to Home screen**. It will then open like a normal app.

## Enable live shared households

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/) and add a **Web app**.
2. Enable **Authentication → Sign-in method → Anonymous**.
3. Create a **Realtime Database** in the same project.
4. In **Realtime Database → Rules**, use the following rules while testing:

```json
{
  "rules": {
    "homes": {
      "$homeId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

5. Copy the web configuration from Firebase and replace `null` in `firebase-config.js` with it:

```js
window.CASA_FIREBASE_CONFIG = {
  apiKey: "…",
  authDomain: "…",
  databaseURL: "…",
  projectId: "…",
  appId: "…"
};
```

6. Publish the complete `app` folder. Create your household once from the published app, tap the profile circle, then **Copy invite link**. Send that link only to people you want in the household. They open it, add the app to their phone, and all edits sync immediately.

The invitation link is the key to the shared household, so treat it like a private family link. For a public production launch, add a sign-in method and membership rules before sharing widely.
