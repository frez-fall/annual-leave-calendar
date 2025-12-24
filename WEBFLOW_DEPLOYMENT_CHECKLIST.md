# Webflow Deployment Checklist

This document verifies that the project is properly configured for both:
1. **Webflow Cloud** (Next.js API backend)
2. **Webflow Code Component** (React frontend component)

## ✅ Webflow Cloud Configuration (Next.js API)

### Required Files & Configuration

- [x] **Next.js 15+**: Updated to `^15.0.0` in `package.json`
- [x] **webflow.json**: Contains `cloud.framework: "nextjs"` configuration
- [x] **next.config.js**: 
  - [x] `basePath` configured (uses `NEXT_PUBLIC_BASE_PATH` env var or empty string)
  - [x] `assetPrefix` configured (matches basePath)
  - [x] CORS headers configured for API routes
- [x] **open-next.config.ts**: Created with OpenNext Cloudflare configuration
- [x] **wrangler.jsonc**: Created for local Edge runtime testing
- [x] **cloudflare-env.d.ts**: Created for environment variable type definitions
- [x] **package.json**:
  - [x] `@opennextjs/cloudflare@^1.6.5` installed
  - [x] `wrangler` installed as dev dependency
  - [x] `preview` script uses OpenNext: `opennextjs-cloudflare build && opennextjs-cloudflare preview`

### API Route Structure

- [x] **pages/api/webflow-proxy.js**: Next.js API route exists and handles Webflow API proxying
- [x] Environment variable access: Uses `process.env.WEBFLOW_API_TOKEN`

### Deployment Steps

1. **Create Webflow Cloud Project**:
   - Connect GitHub repository
   - Create new project
   - Create environment with mount path (e.g., `/api`)

2. **Configure Environment Variables**:
   - In Webflow Cloud dashboard, add:
     - `WEBFLOW_API_TOKEN`: Your Webflow API token
     - `NEXT_PUBLIC_BASE_PATH`: Your mount path (e.g., `/api`)

3. **Deploy**:
   - Push to GitHub (auto-deploys)
   - Or use: `webflow cloud deploy`

4. **Access API**:
   - URL: `https://your-site.webflow.io/YOUR_MOUNT_PATH/api/webflow-proxy`
   - Example: `https://api-site.webflow.io/api/api/webflow-proxy`

## ✅ Webflow Code Component Configuration

### Required Files & Configuration

- [x] **webflow.json**: Contains `library` configuration
  - [x] Library name: "Calendar & Leave Planning"
  - [x] Component pattern: `./src/**/*.webflow.@(js|jsx|mjs|ts|tsx)`
- [x] **src/Calendar.webflow.tsx**: Component definition file exists
- [x] **Component Definition**:
  - [x] Uses `@webflow/react` and `declareComponent`
  - [x] Uses `@webflow/data-types` for props
  - [x] Properly exports component with props configuration
- [x] **vite.config.js**: Configured for library build
  - [x] Builds as ES module
  - [x] Externalizes React and ReactDOM
  - [x] Entry point: `./calendar-component.jsx`

### Dependencies

- [x] `@webflow/react`: Installed
- [x] `@webflow/data-types`: Installed
- [x] `@webflow/webflow-cli`: Installed

### Deployment Steps

1. **Authenticate with Webflow**:
   ```bash
   npx webflow auth login
   ```

2. **Share Component Library**:
   ```bash
   npx webflow library share
   ```

3. **Install on Webflow Site**:
   - Open Webflow Designer
   - Press `L` to open Libraries panel
   - Find "Calendar & Leave Planning"
   - Click "Install"

4. **Configure Component**:
   - Drag component onto canvas
   - Set properties:
     - `siteId`: Your Webflow site ID
     - `apiEndpoint`: Your Webflow Cloud API URL (e.g., `https://api-site.webflow.io/api/api/webflow-proxy`)

## 📝 Important Notes

### Mount Path Configuration

When creating your Webflow Cloud environment:
- Set a mount path (e.g., `/api`)
- Update `NEXT_PUBLIC_BASE_PATH` environment variable in Webflow Cloud to match
- The API will be accessible at: `https://your-site.webflow.io/MOUNT_PATH/api/webflow-proxy`

**Example**:
- Mount path: `/api`
- `NEXT_PUBLIC_BASE_PATH`: `/api`
- API URL: `https://api-site.webflow.io/api/api/webflow-proxy`

### Environment Variables

**Webflow Cloud** (set in Webflow Cloud dashboard):
- `WEBFLOW_API_TOKEN`: Your Webflow API token
- `NEXT_PUBLIC_BASE_PATH`: Your mount path (e.g., `/api`)

**Local Development** (`.env.local`):
- `WEBFLOW_API_TOKEN`: Your Webflow API token (for local testing)
- `WEBFLOW_SITE_ID`: Your Webflow site ID (optional, for testing)

### Testing

**Test API locally**:
```bash
npm run dev          # Start Next.js dev server
npm run preview      # Test with Edge runtime (Wrangler)
```

**Test Component locally**:
```bash
npm run dev:component  # Start Vite dev server
```

## 🔍 Verification Checklist

Before deploying, verify:

- [ ] Next.js version is 15.0.0 or higher
- [ ] All required packages are installed (`npm install`)
- [ ] `webflow.json` contains both `library` and `cloud` configurations
- [ ] `next.config.js` has `basePath` and `assetPrefix` configured
- [ ] `open-next.config.ts` exists and is properly configured
- [ ] `wrangler.jsonc` exists for local testing
- [ ] Component builds successfully: `npm run build:component`
- [ ] Next.js builds successfully: `npm run build`
- [ ] Preview works: `npm run preview` (after build)

## 📚 References

- [Webflow Cloud - Bring Your Own App](https://developers.webflow.com/webflow-cloud/bring-your-own-app)
- [Webflow Code Components - Quick Start](https://developers.webflow.com/code-components/introduction/quick-start)

