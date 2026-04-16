# Deployment Guide: Niyuu Scrapbook

This guide will walk you through deploying your digital scrapbook to the web using **GitHub** and **Vercel**.

## Step 1: Push to GitHub
If you haven't pushed your code to GitHub yet, run these commands in your terminal:

```powershell
git add .
git commit -m "Final cleanup and deployment prep"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Step 2: Connect to Vercel
1.  Go to [Vercel.com](https://vercel.com) and log in with your GitHub account.
2.  Click **"Add New..."** > **"Project"**.
3.  Import your repository.
4.  In the **"Environment Variables"** section, add the following variables from your `.env` file:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
    *   `VITE_CLOUDINARY_CLOUD_NAME`
    *   `VITE_CLOUDINARY_UPLOAD_PRESET`
5.  Click **"Deploy"**.

## Step 3: Automatic Updates
Once linked, every time you run `git push`, Vercel will automatically detect the changes, build the project, and update your live website. 

---

### Why this works:
- **Frontend:** Vercel builds the React/Vite code and serves it via their global CDN.
- **Backend:** The app connects to the **Supabase Cloud**, which is always online regardless of where your frontend is hosted.
- **Routing:** The `vercel.json` file ensures that if you refresh the page while viewing a specific memory, the app correctly reloads from the home page (Standard SPA behavior).

Congratulations! Your story is ready to be shared.
