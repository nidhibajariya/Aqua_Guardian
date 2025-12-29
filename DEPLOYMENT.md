# 🚀 AQUA Guardian Deployment Guide

Follow these steps to deploy the AQUA Guardian platform.

## 1. Backend Deployment (Render)

We use **Render** for the backend because it supports Docker and has enough resources for the TensorFlow ML models.

### Steps:
1.  **Create a Account:** Go to [Render.com](https://render.com/) and sign up.
2.  **New Web Service:** Click **New +** > **Web Service**.
3.  **Connect GitHub:** Connect your GitHub account and select the `Aqua_Guardian` repository.
4.  **Configuration:**
    *   **Name:** `aqua-guardian-backend`
    *   **Root Directory:** `backend`
    *   **Runtime:** `Docker`
5.  **Environment Variables:** Add the following (from your `backend/.env`):
    *   `SUPABASE_URL`
    *   `SUPABASE_KEY`
    *   `SUPABASE_SERVICE_KEY`
6.  **Deploy:** Click **Create Web Service**. 
7.  **URL:** Copy your service URL (e.g., `https://aqua-guardian-backend.onrender.com`).

---

## 2. Frontend Deployment (Vercel)

We use **Vercel** for the frontend for high performance and easy React deployment.

### Steps:
1.  **Create a Account:** Go to [Vercel.com](https://vercel.com/) and sign up.
2.  **Add New Project:** Click **Add New** > **Project**.
3.  **Import GitHub:** Select the `Aqua_Guardian` repository.
4.  **Configure Project:**
    *   **Framework Preset:** `Vite`
    *   **Root Directory:** `frontend`
5.  **Environment Variables:** Add the following:
    *   `VITE_API_URL`: Your **Render Backend URL** (e.g., `https://aqua-guardian-backend.onrender.com`)
    *   `VITE_SUPABASE_URL`: Your Supabase URL
    *   `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
6.  **Deploy:** Click **Deploy**.

---

## 3. Supabase Configuration

To ensure authentication works on the live site:

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Navigate to **Authentication > URL Configuration**.
3.  **Site URL:** Set this to your Vercel URL (e.g., `https://aqua-guardian.vercel.app`).
4.  **Redirect URLs:** Add your Vercel URL to the list.

---

## ✅ Post-Deployment Checklist
- [ ] Open the Vercel URL.
- [ ] Check if the "Demo User" auto-logs in (see console logs).
- [ ] Navigate to the **Report** page and try uploading a photo.
- [ ] Verify that the AI analysis works (it might take a few seconds on the free tier).
