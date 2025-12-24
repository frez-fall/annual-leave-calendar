# Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Vercel Backend

1. **Create Vercel Account** (if you don't have one)
   - Go to [vercel.com](https://vercel.com) and sign up

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

3. **Add Environment Variable**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `WEBFLOW_API_TOKEN` = `your_webflow_api_token`
   - Mark as "Encrypted"
   - Set for all environments (Production, Preview, Development)

4. **Note Your Deployment URL**
   - After deployment, Vercel will give you a URL like: `https://your-app.vercel.app`
   - This is your `apiEndpoint` value

### 3. Get Webflow API Token

1. Go to [Webflow Account Settings](https://webflow.com/dashboard/account)
2. Navigate to "Apps & Integrations" → "API Access"
3. Generate a new API token
4. Copy the token (you'll use this in Vercel environment variables)

### 4. Get Webflow Site ID

1. In Webflow Designer, go to Project Settings
2. Find your Site ID (or use the Webflow API to list sites)

### 5. Configure Component in Webflow

1. **Add Component to Webflow**
   - Import the component code into your Webflow project
   - Or use Webflow DevLink to connect your codebase

2. **Set Component Properties**
   - `siteId`: Your Webflow site ID
   - `apiEndpoint`: Your Vercel URL (e.g., `https://your-app.vercel.app`)

3. **Test the Component**
   - Preview your site
   - The component should load and fetch collections automatically

## Development Mode (Testing Only)

For local testing without Vercel:

```javascript
// In component properties
{
  siteId: "your-site-id",
  apiToken: "your-api-token" // ⚠️ NOT secure for production
}
```

## Troubleshooting

### Component shows "Loading..." forever
- Check browser console for errors
- Verify `siteId` is correct
- Verify `apiEndpoint` is correct and Vercel function is deployed
- Check Vercel function logs

### "Public holidays collection not found"
- Ensure you have a collection named "Public Holidays" (case-insensitive)
- Collection must be published

### "Network error: Unable to reach backend proxy"
- Verify Vercel deployment is live
- Check `apiEndpoint` prop is set correctly
- Verify CORS is configured in `vercel.json`

### "API token not configured"
- Check Vercel environment variables
- Ensure `WEBFLOW_API_TOKEN` is set
- Redeploy after adding environment variables

## Next Steps

1. Customize styling in `styles.css`
2. Adjust Mantine theme if needed
3. Test with different collection structures
4. Deploy to production

