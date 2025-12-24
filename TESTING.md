# Testing Guide - Calendar Component with Real Webflow Data

This guide will help you test the calendar component with real data from your Webflow CMS.

## Prerequisites

1. **Webflow API Token**
   - Go to: https://webflow.com/dashboard/account/developer
   - Create a new API token
   - Copy the token

2. **Webflow Site ID**
   - Open your Webflow site in the Designer
   - Go to Site Settings → General
   - Find your Site ID (or check the URL: `https://webflow.com/design/YOUR_SITE_ID`)

3. **`.env.local` file**
   - Already created in the project root
   - Contains: `WEBFLOW_API_TOKEN=your_token_here`
   - The Site ID will be entered in the test UI (not in `.env.local`)

## Local Testing Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start Next.js Dev Server (Terminal 1)

This starts the backend API proxy that will securely handle Webflow API requests:

```bash
npm run dev
```

The server will start at `http://localhost:3000` and automatically read your `WEBFLOW_API_TOKEN` from `.env.local`.

The API endpoint will be available at: `http://localhost:3000/api/webflow-proxy`

**Note:** Next.js automatically loads `.env.local` files, so no manual configuration needed.

### Step 3: Start Vite Dev Server (Terminal 2)

In a new terminal, start the frontend development server for component testing:

```bash
npm run dev:component
```

This will start the test interface at `http://localhost:5173` (or similar port).

### Step 4: Configure and Test

1. Open `http://localhost:5173` in your browser
2. In the test interface:
   - **Webflow Site ID**: Enter your Site ID
   - **API Endpoint**: Enter `http://localhost:3000/api/webflow-proxy`
   - **Use Mock Data**: **Uncheck** this box (to use real data)
3. Click "Load Component"

The component will now fetch real data from your Webflow CMS!

## Troubleshooting

### "API token not configured"
- Make sure `.env.local` exists in the project root
- Verify `WEBFLOW_API_TOKEN` is set correctly (no quotes needed)
- Restart the Next.js dev server after creating/editing `.env.local`
- Next.js automatically loads `.env.local` files

### "Network error: Unable to reach backend proxy"
- Make sure the Next.js dev server is running (`npm run dev`)
- Check that the API Endpoint in the test UI is `http://localhost:3000/api/webflow-proxy` (include the full path)
- Verify the Next.js server is running on port 3000 (check terminal output)

### "Public holidays collection not found"
- Ensure you have a CMS collection named "Public Holidays" (case-insensitive)
- Check that the collection is published
- Verify your Site ID is correct

### CORS Errors
- Make sure you're using the Vercel proxy (`http://localhost:3000`), not direct API token
- Direct API tokens will NOT work in browsers due to CORS restrictions

## Production Deployment

### Option A: Webflow Cloud (Recommended)

1. **Connect GitHub Repository:**
   - Create a new Webflow site (or use existing) for the API
   - In Webflow Cloud, connect your GitHub repository
   - Configure build settings if needed

2. **Set Environment Variable in Webflow Cloud:**
   - Go to your Webflow Cloud project settings
   - Navigate to Environment Variables
   - Add: `WEBFLOW_API_TOKEN` = `your_token_here`

3. **Deploy:**
   - Webflow Cloud will automatically deploy from your GitHub repository
   - Note your deployment URL (e.g., `https://your-api-site.webflow.io`)

4. **Use Webflow Cloud URL:**
   - In Webflow component settings, use your Webflow Cloud URL as the `apiEndpoint`
   - Example: `https://your-api-site.webflow.io/api/webflow-proxy`

### Option B: Vercel (Alternative)

1. **Deploy to Vercel:**
   ```bash
   vercel deploy
   ```

2. **Set Environment Variable in Vercel Dashboard:**
   - Go to your Vercel project settings
   - Navigate to Environment Variables
   - Add: `WEBFLOW_API_TOKEN` = `your_token_here`

3. **Use Vercel URL:**
   - In Webflow component settings, use your Vercel deployment URL as the `apiEndpoint`
   - Example: `https://your-app.vercel.app/api/webflow-proxy`

## Quick Reference

| What | Where | Example |
|------|-------|---------|
| API Token | `.env.local` | `WEBFLOW_API_TOKEN=abc123...` |
| Site ID | Test UI input | Enter in browser form |
| Local API Endpoint | Test UI input | `http://localhost:3000/api/webflow-proxy` |
| Production API Endpoint | Webflow component props | `https://your-api-site.webflow.io/api/webflow-proxy` |

