# Next Steps - Next.js API Conversion Complete

## ✅ Completed

1. **Next.js API Route Created**
   - Location: `pages/api/webflow-proxy.js`
   - Converted from Vercel serverless function format
   - Removed manual `.env.local` loading (Next.js handles this automatically)

2. **Dependencies Installed**
   - Next.js v14.2.35 installed
   - All dependencies up to date

3. **Configuration Files**
   - `next.config.js` - Next.js configuration with CORS headers
   - `pages/_app.js` - Minimal Next.js app setup
   - `pages/index.js` - Simple landing page

4. **Documentation Updated**
   - README.md - Updated for Webflow Cloud deployment
   - TESTING.md - Updated for Next.js dev server
   - DEPLOYMENT.md - Added Webflow Cloud deployment guide

## 🚀 Ready to Test

### Local Testing

1. **Start Next.js Dev Server:**
   ```bash
   npm run dev
   ```
   This will start the server at `http://localhost:3000`

2. **Test API Endpoint:**
   - API will be available at: `http://localhost:3000/api/webflow-proxy`
   - Make sure `.env.local` exists with `WEBFLOW_API_TOKEN`

3. **Test Component (separate terminal):**
   ```bash
   npm run dev:component
   ```
   This starts the Vite dev server for component testing at `http://localhost:5173`
   - In the test UI, set API Endpoint to: `http://localhost:3000/api/webflow-proxy`

### Verify API is Working

You can test the API endpoint directly:

```bash
curl -X POST http://localhost:3000/api/webflow-proxy \
  -H "Content-Type: application/json" \
  -d '{
    "siteId": "your-site-id",
    "method": "GET",
    "path": "collections"
  }'
```

## 📦 Deploy to Webflow Cloud

### Step 1: Push to GitHub

1. Initialize git (if not already):
   ```bash
   git init
   git add .
   git commit -m "Convert API to Next.js for Webflow Cloud"
   ```

2. Create a GitHub repository and push:
   ```bash
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

### Step 2: Connect to Webflow Cloud

1. Create a new Webflow site (or use existing) for the API
2. In Webflow Cloud dashboard:
   - Go to Site Settings → "Bring Your Own App"
   - Connect your GitHub repository
   - Configure build settings:
     - Build command: `npm run build`
     - Output directory: `.next` (or leave default)

### Step 3: Set Environment Variables

1. In Webflow Cloud dashboard:
   - Go to Project Settings → Environment Variables
   - Add: `WEBFLOW_API_TOKEN` = `your_webflow_api_token`
   - Save

### Step 4: Deploy

1. Webflow Cloud will automatically deploy from GitHub
2. After deployment, note your site URL (e.g., `https://your-api-site.webflow.io`)
3. Your API endpoint will be at: `https://your-api-site.webflow.io/api/webflow-proxy`

### Step 5: Update Component

1. In your Webflow site (where the component is used):
   - Select the Calendar component
   - In Properties panel, set:
     - `apiEndpoint` = `https://your-api-site.webflow.io/api/webflow-proxy`
     - `siteId` = Your Webflow site ID

## 📝 Important Notes

- **API Endpoint Path**: Always include `/api/webflow-proxy` in the full URL
- **Environment Variables**: Next.js automatically loads `.env.local` for local development
- **CORS**: Currently set to allow all origins (`*`). In production, consider restricting to specific Webflow domains
- **Component Unchanged**: The Calendar component code remains exactly the same - only the API endpoint location changes

## 🔄 Alternative: Still Using Vercel

If you prefer to keep using Vercel, the old API route at `api/webflow-proxy/index.js` is still available. Just use:
- `apiEndpoint` = `https://your-app.vercel.app/api/webflow-proxy`

## 🐛 Troubleshooting

### "Module not found" errors
- Run `npm install` again
- Make sure `next` is in `package.json` dependencies

### API endpoint not responding
- Check that Next.js dev server is running (`npm run dev`)
- Verify the endpoint path includes `/api/webflow-proxy`
- Check browser console for CORS errors

### Environment variable not loading
- Make sure `.env.local` exists in project root
- Restart Next.js dev server after editing `.env.local`
- For production, set in Webflow Cloud dashboard

