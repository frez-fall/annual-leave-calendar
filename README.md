# Webflow Calendar & Leave Planning Component

A reusable Webflow code component for calendar and leave planning that dynamically adapts to each site's CMS collections (public holidays, school holidays, and states) without requiring code modifications between deployments.

## Features

- **Dynamic Collection Detection**: Automatically detects and adapts to available CMS collections
- **Interactive Calendar**: Mantine DatePicker with date range selection
- **Holiday Highlighting**: Visual indicators for public holidays, school holidays, and weekends
- **State Filtering**: Optional state dropdown for filtering state-specific holidays
- **Automatic Calculations**:
  - Total Days Off
  - Leave Days Used (excluding weekends and holidays)
  - School Days Absent (excluding weekends, holidays, and school holiday periods)

## Architecture

### Component Structure

- **Frontend**: React component with Mantine UI (Webflow Code Component)
- **Backend**: Next.js API route for secure API proxying (deployed on Webflow Cloud)
- **API Client**: Supports both direct API calls (dev) and backend proxy (production)

### Collections Required

1. **Public Holidays** (Required)
   - `DateTime` field for date
   - Optional `Reference`/`MultiReference` field to States collection
   - `PlainText` field for name

2. **School Holidays** (Optional)
   - `DateTime` fields for start-date and end-date
   - Optional `Reference` field to States collection
   - `PlainText` field for name

3. **States** (Optional)
   - `PlainText` field for name
   - `PlainText` field for slug

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Deploy API Backend to Webflow Cloud

**Option A: Webflow Cloud (Recommended)**

1. Create a new Webflow site for the API (or use an existing one)
2. Connect your GitHub repository to Webflow Cloud
3. In Webflow Cloud dashboard, add environment variable:
   - Key: `WEBFLOW_API_TOKEN`
   - Value: Your Webflow API token
4. Deploy the Next.js app to Webflow Cloud
5. Note your Webflow Cloud deployment URL (e.g., `https://your-api-site.webflow.io`)

**Note**: The API backend must be deployed to Webflow Cloud. The component is designed to work with Webflow Cloud's Next.js hosting.

### 3. Share Component to Webflow

1. **Authenticate with Webflow**:
   ```bash
   npx webflow auth login
   ```

2. **Share Component Library**:
   ```bash
   npx webflow library share
   ```

3. **Install on Your Webflow Site**:
   - Open your Webflow site in Designer
   - Press `L` to open Libraries panel
   - Find "Calendar & Leave Planning" library
   - Click "Install"

### 4. Configure Component in Webflow

1. Press `⇧C` to open Components panel
2. Find "Calendar & Leave Planner" under "Data" group
3. Drag component onto canvas
4. In Properties panel, configure:
   - **Site ID**: Your Webflow site ID (required)
   - **API Endpoint**: Your Webflow Cloud API URL (e.g., `https://your-api-site.webflow.io/api/webflow-proxy`)
   - **Theme**: Light or Dark mode (default: Dark)
   - **Default State**: Optional default state selection
   - **Locale**: Date formatting locale (default: en-US)

## File Structure

```
Calendar/
├── pages/
│   ├── api/
│   │   └── webflow-proxy.js  # Next.js API route (Webflow Cloud)
│   ├── _app.js               # Next.js app entry point
│   └── index.js              # Next.js landing page
├── src/
│   ├── Calendar.tsx          # React component
│   ├── Calendar.webflow.tsx  # Webflow component definition
│   ├── CustomDropdown.tsx    # Custom dropdown component
│   ├── main.tsx              # Local testing entry point
│   └── mock-data.ts          # Mock data for testing
├── webflow-api.js            # Webflow API client
├── api-proxy.js              # Backend proxy client
├── collection-detector.js    # Collection detection logic
├── data-processor.js         # Data normalization
├── calculations.js           # Calculation engine
├── date-utils.js            # Date utility functions
├── calendar-component.jsx    # Calendar component wrapper
├── calendar-ui.jsx           # Calendar UI component
├── styles.css                # Component styles
├── package.json             # Dependencies
├── next.config.js           # Next.js configuration
├── webflow.json             # Webflow configuration
├── open-next.config.ts      # OpenNext config for Webflow Cloud
├── wrangler.jsonc           # Wrangler config for local testing
├── cloudflare-env.d.ts      # Cloudflare type definitions
└── README.md                # This file
```

## Usage

### Component Props

```typescript
{
  // Required
  siteId: string,              // Webflow site ID
  apiEndpoint: string,         // Webflow Cloud backend URL

  // Optional
  theme: 'light' | 'dark',    // Theme mode (default: 'dark')
  defaultState: string,        // Default state ID or name
  locale: string,             // Date locale (default: 'en-US')
}
```

## Security

- **API Token**: Always stored server-side in Webflow Cloud environment variables, never exposed to the client
- **Backend Proxy**: All API requests go through the Next.js API route on Webflow Cloud, which securely handles authentication

## API Endpoints Used

- `GET /sites/{siteId}/collections` - List collections
- `GET /collections/{collectionId}` - Get collection schema
- `GET /collections/{collectionId}/items` - List collection items (with pagination)

## Calculations

### Total Days Off
Selected dates + all holidays (public + school) within the selected range

### Leave Days Used
Selected dates excluding:
- Weekends
- Public holidays
- School holidays

### School Days Absent
Selected dates excluding:
- Weekends
- Public holidays
- School holiday periods

## Troubleshooting

### "Public holidays collection not found"
- Ensure you have a collection named "Public Holidays" (case-insensitive)
- Check that the collection is published

### "Network error: Unable to reach backend proxy"
- Verify your Webflow Cloud deployment is live
- Check that `apiEndpoint` prop is set correctly (include `/api/webflow-proxy` path)
- Verify CORS is configured in `next.config.js`

### "API token not configured"
- Ensure `WEBFLOW_API_TOKEN` is set in Webflow Cloud environment variables
- Set in Webflow Cloud dashboard → Project Settings → Environment Variables
- Redeploy after adding environment variables

### Component not appearing in Webflow
- Run `npx webflow library share` to upload component
- Ensure library is installed on your site
- Check that `Calendar.webflow.tsx` file exists in `src/` directory

## Development

### Local Development

**For API testing (Next.js):**
```bash
npm run dev
```
This starts the Next.js dev server with API routes at `http://localhost:3000/api/webflow-proxy`

**For component development (Vite):**
```bash
npm run dev:component
```
This starts the Vite dev server for component testing at `http://localhost:5173`

### Share Updates to Webflow

After making changes:

```bash
npx webflow library share
```

This will update the component in your Webflow workspace.

## License

MIT
