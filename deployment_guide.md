# Client Review Sharing Guide

To let your client review the website, you have two main options: **Instant Tunneling** (sharing your local screen) or **Permanent Deployment** (hosting it online).

---

## 🚀 Option 1: Instant Tunneling (Recommended for quick reviews)
This allows you to share your local development server directly without uploading any files.

### Using Localtunnel (Easiest)
1. Keep your development server running (`npm run dev`).
2. Open a **new terminal** in the project folder.
3. Run the following command:
   ```bash
   npx localtunnel --port 5173
   ```
   *(Replace 5173 with the port number shown in your Vite terminal if it's different)*
4. You will get a URL (e.g., `https://cold-lions-sleep.loca.lt`). Share this with your client!

---

## 🌐 Option 2: Permanent Deployment (Best for final approval)
This hosts the site on a permanent URL that stays online.

### Deploying to Vercel (Fast & Free)
1. Install the Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Run the deploy command:
   ```bash
   vercel
   ```
3. Follow the prompts (Select "Yes" for everything).
4. Vercel will build the project and give you a production-ready link (e.g., `pilot-website.vercel.app`).

---

## 🛠️ How to use the Review Feature
1. Once the client opens the link, they will see a **"💬 Send Feedback"** button in the bottom-right corner.
2. They can click it to leave comments on specific sections.
3. For now, feedback is logged to the browser console (Press `F12` > `Console` to view while they are testing if you are screen-sharing, or we can integrate a backend/email service if needed later).
