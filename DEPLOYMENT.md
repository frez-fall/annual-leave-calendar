# Deployment Guide

## Webflow Code Component Deployment

### 1. Install Dependencies

```bash
npm install
```

### 2. Authenticate with Webflow

**Option A: Browser Authentication (if it works):**
```bash
npx webflow auth login
```

This will open a browser window to authenticate your Webflow workspace.

**Option B: Manual Workspace Token (Recommended if browser auth fails):**

1. **Get your Webflow Workspace Token:**
   - Go to: https://webflow.com/dashboard/account/developer
   - Or: https://webflow.com/dashboard/account/apps
   - Look for "Workspace Token" or generate a new one
   - **Note:** This is different from your API token (`WEBFLOW_API_TOKEN`)

2. **Create a `.env` file in the project root** (not `.env.local`):
   ```bash
   WEBFLOW_WORKSPACE_TOKEN=your_workspace_token_here
   ```

3. **Verify authentication works:**
   ```bash
   npx webflow library share
   ```

**Troubleshooting:** If browser authentication fails, see `AUTH_TROUBLESHOOTING.md` for detailed solutions.

### 3. Share Component Library to Webflow

```bash
npx webflow library share
```

This command will:
- Bundle your component library
- Upload it to your Webflow workspace
- Make it available for installation on your sites

### 4. Install Component on Your Webflow Site

1. Open your Webflow site in the Designer
2. Press `L` or click the Resources icon in the left sidebar
3. Find "Calendar & Leave Planning" in the available libraries
4. Click "Install" next to the library
5. The component will now be available in the Components panel

### 5. Configure Component Properties

1. Press `⇧C` or click the Components icon
2. Find "Calendar & Leave Planner" under the "Data" group
3. Drag the component onto your canvas
4. In the Properties panel, configure:
   - **Site ID**: Your Webflow site ID (required)
   - **API Endpoint**: Your Vercel backend URL (recommended for production)
   - **API Token**: Direct API token (development/testing only)
   - **Default State**: Optional default state selection
   - **Locale**: Date formatting locale (default: en-US)

## API Backend Deployment

### Option A: Webflow Cloud (Recommended)

#### 1. Prepare for Deployment

1. Ensure your code is pushed to a GitHub repository
2. Make sure `pages/api/webflow-proxy.js` exists (Next.js API route)
3. Verify `next.config.js` is configured

#### 2. Create Webflow Cloud Site

1. Create a new Webflow site (or use an existing one) for hosting the API
2. This site will serve as your API backend
3. Note: You can use one API site to serve multiple Webflow sites

#### 3. Connect GitHub Repository

1. In Webflow Cloud dashboard, go to your site settings
2. Navigate to "Bring Your Own App" or "Git Integration"
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `.next` (or as per Next.js defaults)

#### 4. Add Environment Variable

1. In Webflow Cloud dashboard, go to your project settings
2. Navigate to Environment Variables
3. Add: `WEBFLOW_API_TOKEN` = `your_webflow_api_token`
4. Save and redeploy

#### 5. Deploy

1. Webflow Cloud will automatically deploy from your GitHub repository
2. After deployment, note your site URL (e.g., `https://your-api-site.webflow.io`)
3. Your API endpoint will be at: `https://your-api-site.webflow.io/api/webflow-proxy`

#### 6. Update Component in Webflow

1. Open your Webflow site (where the component is used)
2. Select the Calendar component
3. In Properties panel, set:
   - `apiEndpoint` = `https://your-api-site.webflow.io/api/webflow-proxy`
   - `siteId` = Your Webflow site ID

### Option B: Vercel (Alternative)

#### 1. Deploy to Vercel

```bash
vercel
```

Follow the prompts to:
- Link to existing project or create new
- Configure project settings
- Deploy

#### 2. Add Environment Variable

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `WEBFLOW_API_TOKEN` = `your_webflow_api_token`
3. Mark as "Encrypted"
4. Set for all environments (Production, Preview, Development)

#### 3. Get Deployment URL

After deployment, Vercel will provide a URL like:
```
https://your-app.vercel.app
```

Use this as the `apiEndpoint` value in your Webflow component (include `/api/webflow-proxy` path).

#### 4. Update Component in Webflow

1. Open your Webflow site
2. Select the Calendar component
3. In Properties panel, set:
   - `apiEndpoint` = `https://your-app.vercel.app/api/webflow-proxy`

## Testing

### Local Development

**For API testing:**
1. Run `npm run dev` to start Next.js development server
2. API will be available at `http://localhost:3000/api/webflow-proxy`
3. Test API functionality locally

**For component testing:**
1. Run `npm run dev:component` to start Vite development server
2. Test component functionality locally
3. Make changes and test

### Webflow Preview

1. After sharing library, install on a test site
2. Configure component properties
3. Preview site to test functionality
4. Check browser console for any errors

## Troubleshooting

### "Library not found" in Webflow
- Ensure you've run `npx webflow library share`
- Check that you're logged in: `npx webflow auth login`
- Verify workspace token is correct

### Component not appearing in Components panel
- Ensure library is installed on the site
- Check that component file ends with `.webflow.tsx`
- Verify `webflow.json` configuration is correct

### API errors in component
- Verify `siteId` is correct
- Check `apiEndpoint` is set correctly (include full path: `/api/webflow-proxy`)
- Verify Webflow Cloud or Vercel deployment is live and working
- Check environment variables are set in deployment platform
- Test API endpoint directly in browser or Postman

### Component shows "Loading..." forever
- Check browser console for errors
- Verify API endpoint is accessible
- Check network tab for failed requests
- Verify collections exist in Webflow CMS

## Next Steps

- Customize component styling
- Add additional features
- Test across different sites
- Deploy to production

