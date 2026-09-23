# Tracula Services website

A single-page site hosted free on GitHub Pages. The "Start the conversation" form saves each submission to Firebase Firestore.

## What's in this folder

| File | What it does |
|---|---|
| `index.html` | The whole homepage |
| `app.js` | Makes the form work and sends submissions to Firebase |
| `firebase-config.js` | Where your Firebase project's config goes (the only file you edit) |
| `firestore.rules` | Security rules: anyone can submit, nobody can read leads from the site |
| `assets/` | Logo files |

---

## Part 1: Set up Firebase (about 10 minutes)

1. Go to https://console.firebase.google.com and sign in with the Google account you want to own the leads.
2. Click **Create a project**. Name it something like `tracula-services`. You can turn Google Analytics off.
3. In the left menu, open **Build > Firestore Database**, then **Create database**.
   - Choose **Start in production mode**.
   - Pick a location in the US (for example `nam5`). This can't be changed later.
4. Open the **Rules** tab in Firestore. Delete what's there, paste in everything from `firestore.rules`, and click **Publish**.
5. Click the gear icon > **Project settings**. Under **Your apps**, click the web icon (`</>`).
   - Nickname it `Tracula website`. Leave "Firebase Hosting" unchecked. Click **Register app**.
   - Firebase shows a block of code with `const firebaseConfig = { ... }`. Copy just the values inside the braces.
6. Open `firebase-config.js` and replace each `PASTE_...` value with yours. Save.

The config values are designed to be public in website code. What protects your leads is the rules file from step 4.

## Part 2: Put the site on GitHub Pages (about 10 minutes)

1. Sign in at https://github.com (or create a free account).
2. Click **+ > New repository**. Name it `tracula-site`, set it to **Public**, and click **Create repository**.
3. On the new repo page, click **uploading an existing file**. Drag in everything from this folder, including the `assets` folder. Click **Commit changes**.
4. Go to the repo's **Settings > Pages**. Under **Build and deployment**, set Source to **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
5. In a minute or two, the site is live at `https://YOUR-USERNAME.github.io/tracula-site/`.

**Test it:** Fill in the form on the live site and send it. Then open Firebase > Firestore Database > **Data**. You should see a `leads` collection with your test in it.

## Part 3: Point tracula.net at the new site

Do this only after the GitHub version is tested and working. It switches your domain off the Wix site.

1. In the repo, go to **Settings > Pages > Custom domain**, enter `www.tracula.net`, and save.
2. Wherever tracula.net's DNS is managed (if you bought it through Wix, that's Wix's Domains page), set:
   - A **CNAME** record: host `www`, value `YOUR-USERNAME.github.io`
   - Four **A** records for the root domain (`@`): `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Remove any old records that point `www` or `@` at Wix.
3. DNS can take anywhere from a few minutes to 48 hours. Once GitHub shows the domain as verified, check **Enforce HTTPS**.

## Viewing your leads

Firebase console > Firestore Database > Data > `leads`. Each submission shows the name, store, email, phone, role, locations, topics picked, message, how they heard about you, and a timestamp.

## Optional, later

- **Email alert for every new lead:** Upgrade Firebase to the Blaze (pay-as-you-go) plan and install the "Trigger Email" extension. At this volume it should cost next to nothing, but it does require a card on file.
- **Lock the API key to your domain:** In Google Cloud console > APIs & Services > Credentials, restrict the browser key to `tracula.net/*`, `www.tracula.net/*`, and `YOUR-USERNAME.github.io/*`.
