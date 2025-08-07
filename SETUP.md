## How to setup for a new deployment

- Go to [firebase.google.com](https://firebase.google.com) and create a new project <br>
  The project should be created from client's account<br>
  When asked to enable google analytics, disable it

- Then create a web project (name doesn't matter just put "webapp")<br>
  (Don't setup firebase hosting, leave it unselected)<br>
  Save the "firebaseConfig" code which comes up in next step

  ```
  const firebaseConfig = {
    apiKey: "...",
    authDomain: "....firebaseapp.com",
    projectId: "...",
    storageBucket: "....appspot.com",
    messagingSenderId: "...",
    appId: ".:...:web:..."
  };
  ```

  This will be used to setup environment variables later

- Goto "Authentication"<br>
  Click on "Get Started"<br>
  Then in "Sign-in methods" tab enable email/password auth<br>
  (Keep the passwordless sign in disabled)

- Enable "Realtime Database" and "Storage"<br>
  For storage, for mode select production mode, and "asia-south1" for location<br>
  For realtime database, select United States for location and for mode select locked mode

- Now for setting up the rules for database and storage you can do it in 2 ways

  1. Copy paste the rules (recommended)

     - In firebase console go to "Realtime database" and open "Rules" tab
     - Copy paste the contents of `rules/database.rules.json` file
     - In firebase console go to "Storage" and open "Rules" tab
     - Copy paste the contents of `rules/storage.rules` file

  2. With firebase cli

     - Clone the repo
     - Make sure you have firebase cli tools (Install with `npm i -g firebase-tools`)
     - Login to firebase with `firebase login`
     - Open up `.firebaserc` file and make sure app id is correct
     - Then in the project directory run `firebase deploy`

- Now go to [vercel.com](vercel.com) and click new project then select the repo from github<br>
  Under the environment variables set the variables as follows from firebase Config you got in 2nd step<br>

  | Env var name                             | Value from key in firebaseConfig |
  | ---------------------------------------- | -------------------------------- |
  | NEXT_PUBLIC_FIREBASE_API_KEY             | apiKey                           |
  | NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN         | authDomain                       |
  | NEXT_PUBLIC_FIREBASE_PROJECT_ID          | projectId                        |
  | NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET      | storageBucket                    |
  | NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID | messagingSenderId                |
  | NEXT_PUBLIC_FIREBASE_APP_ID              | appId                            |

  And if you want to change name of the app Add a variable named "NEXT_PUBLIC_NAME" and set value to whatever name you want to be

- And now you need to go below and setup CORS

## CORS Setup

- Open up the project in google cloud https://console.cloud.google.com

- Open the cloud shell for the project from top right (terminal like icon)

- Type in `nano cors.json` and hit enter

- Copy the following and paste it in there (paste using right-click > paste)

  Replace https://example.com with your website, keep the quotes.

  ```json
  [
    {
      "origin": ["https://example.com"],
      "method": ["GET"],
      "maxAgeSeconds": 3600
    }
  ]
  ```

- Hit `Ctrl+s` then `Ctrl+x`

- Run command with your storage bucket

  ```bash
  gsutil cors set cors.json gs://<storage-bucket>
  ```

  Example:

  ```bash
  gsutil cors set cors.json gs://quiz-platform-c4708.appspot.com
  ```

- You're done!

- The deployment should run smoothly now...
