# Webflow CLI Authentication Troubleshooting

## Issue: "Authentication failed. You may close this window."

This error typically occurs when the browser-based OAuth flow fails. Here are several solutions:

## ⚠️ Common Cause: Browser Window Issues

**If you closed the browser window that the CLI opened and pasted the URL into a different window/incognito:**

This will **always fail** because:
1. The CLI opens a local server to receive the OAuth callback
2. The OAuth flow expects the callback in the same browser session
3. Opening in incognito or a different window breaks the callback connection
4. The CLI can't receive the authentication token

**Solution:** Always use the browser window that the CLI automatically opens. Don't close it or copy the URL elsewhere.

## Solution 1: Try Browser Authentication Again (Correctly)

**The proper workflow:**

1. Run the command:
   ```bash
   npx webflow auth login
   ```

2. **Wait for the browser window to open automatically** - Don't close it!

3. **Complete authentication in that same window:**
   - Log in to Webflow if needed
   - Authorize the CLI access
   - Wait for the "Authentication successful" message

4. **Don't:**
   - ❌ Close the browser window
   - ❌ Copy the URL to a different browser/incognito
   - ❌ Open the URL manually
   - ❌ Switch browser tabs during authentication

5. **If the window doesn't open automatically:**
   - The CLI will show a URL in the terminal
   - Copy that URL and paste it into your **default browser** (not incognito)
   - Complete authentication in that same browser session

## Solution 2: Use Workspace Token (Recommended Alternative)

Instead of browser authentication, you can manually set a workspace token in a `.env` file:

1. **Get your Webflow Workspace Token:**
   - Go to: https://webflow.com/dashboard/account/developer
   - Or: https://webflow.com/dashboard/account/apps
   - Generate or copy your workspace token

2. **Create or update `.env` file in project root:**
   ```bash
   WEBFLOW_WORKSPACE_TOKEN=your_workspace_token_here
   ```

3. **Verify the token works:**
   ```bash
   npx webflow library share
   ```

**Note:** The workspace token is different from the API token (`WEBFLOW_API_TOKEN`). The workspace token is used for CLI authentication, while the API token is used for API requests.

## Solution 2: Force Re-authentication

Try forcing a fresh authentication:

```bash
npx webflow auth login --force
```

This will:
- Clear any existing cached credentials
- Open a new browser window for authentication
- Save new credentials to `.env`

## Solution 3: Check Browser and Network

1. **Ensure browser allows popups:**
   - The CLI opens a browser window for OAuth
   - Check if popup blockers are enabled
   - Try a different browser

2. **Check network/firewall:**
   - Ensure you can access `webflow.com`
   - Check if corporate firewall is blocking OAuth callbacks
   - Try from a different network

3. **Clear browser cache:**
   - Clear cookies for `webflow.com`
   - Try incognito/private browsing mode

## Solution 4: Manual Token Setup

If browser authentication continues to fail:

1. **Get workspace token from Webflow Dashboard:**
   - Log into Webflow
   - Go to Account Settings → Developer/Apps
   - Copy your workspace token

2. **Create `.env` file in project root:**
   ```bash
   echo "WEBFLOW_WORKSPACE_TOKEN=your_token_here" > .env
   ```

3. **Test authentication:**
   ```bash
   npx webflow library share
   ```

## Solution 5: Check CLI Version

Ensure you're using the latest CLI version:

```bash
npm install -g @webflow/webflow-cli@latest
```

Or use npx (recommended):
```bash
npx @webflow/webflow-cli@latest auth login
```

## Solution 6: Verbose Debugging

Run with verbose flag to see detailed error messages:

```bash
npx webflow auth login --verbose
```

This will show:
- Detailed error messages
- Network request details
- OAuth callback information

## Verification

After setting up authentication, verify it works:

```bash
# This should work without errors
npx webflow library share
```

If you see "Library shared successfully" or similar, authentication is working.

## Common Issues

### "Workspace token not found"
- Ensure `.env` file exists in project root (not `.env.local`)
- Check that `WEBFLOW_WORKSPACE_TOKEN` is set correctly
- Verify no extra spaces or quotes around the token

### "Invalid token"
- Regenerate your workspace token in Webflow dashboard
- Ensure you're using workspace token, not API token
- Check token hasn't expired

### Browser window doesn't open
- Check terminal for URL to manually open
- Try running with `--no-input` flag disabled
- Check system browser settings

## Next Steps

Once authenticated, you can:
1. Share your component library: `npx webflow library share`
2. Deploy to Webflow Cloud: `npx webflow cloud deploy`
3. Manage your libraries: `npx webflow library --help`

## References

- [Webflow CLI Documentation](https://developers.webflow.com/cli)
- [Webflow Account Settings](https://webflow.com/dashboard/account/developer)

