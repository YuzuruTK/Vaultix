# Cloudflare Pages Deployment Guide

## Overview

Vaultix is configured to run on Cloudflare Pages with full-stack capabilities using edge functions. This deployment option provides:

- **Global Performance**: Automatic CDN distribution across Cloudflare's edge network
- **Serverless**: No server management, auto-scaling out of the box
- **Edge Functions**: Server-side rendering and dynamic routes at the edge
- **Free Tier**: Includes generous free tier with 100,000 requests/day
- **Git Integration**: Automatic deployments from GitHub/GitLab/Bitbucket

## Prerequisites

1. **Cloudflare Account**: https://dash.cloudflare.com/
2. **Git Repository**: GitHub, GitLab, or Bitbucket
3. **Domain** (optional): Can use `.pages.dev` subdomain or custom domain

## Setup Steps

### Step 1: Connect Your Repository

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages**
3. Click **Create a project** → **Connect to Git**
4. Select your Git provider and authorize
5. Select the `Vaultix` repository

### Step 2: Configure Build Settings

When connecting your repository, set these values:

- **Production branch**: `main`
- **Build command**: `npm run build`
- **Build output directory**: `build/client`

### Step 3: Environment Variables (Optional)

If you need environment variables:

1. In Pages project settings, go to **Settings** → **Environment variables**
2. Add any custom variables needed

### Step 4: Deploy

Click **Save and Deploy**. Cloudflare will:

1. Build your project using `npm run build`
2. Deploy to the global edge network
3. Provide a `.pages.dev` URL (e.g., `vaultix.pages.dev`)

## Project Structure for Pages

```
build/
  client/          ← Static assets served globally
  server/          ← Server code (build artifact)
functions/
  [[path]].ts      ← Catch-all edge function for SSR
wrangler.json      ← Cloudflare Pages configuration
```

## How It Works

1. **Client Assets**: Static files (`/build/client`) are cached globally
2. **Dynamic Requests**: All requests route through the `[[path]].ts` function
3. **Server Rendering**: The function renders React on the edge
4. **HTML Response**: Fully rendered HTML is returned to the browser

## Deploy from CLI (Optional)

If you prefer CLI deployment instead of Git integration:

1. Install Wrangler:
   ```bash
   npm install -g wrangler
   ```

2. Authenticate:
   ```bash
   wrangler login
   ```

3. Deploy:
   ```bash
   wrangler pages deploy build/client
   ```

## Connect Custom Domain

1. In Pages project, go to **Custom domains**
2. Add your domain (e.g., `vaultix.example.com`)
3. Update your DNS records at your registrar

## Monitoring

After deployment:

1. View analytics: Dashboard → **Pages** → Your project → **Analytics**
2. Check logs: **Logs** tab (real-time request logs)
3. Set up alerts for errors or performance issues

## Limitations & Considerations

| Feature | Status | Notes |
|---------|--------|-------|
| Server-side rendering | ✅ Supported | Full SSR via edge functions |
| Static assets | ✅ Optimized | Cached globally |
| CSV uploads | ✅ Works | Stored in browser (localStorage) |
| Sessions | ⚠️ Limited | Stateless - use client-side storage |
| Database | ❌ Not included | Would need external service |
| File storage | ❌ Not available | Use external service like R2 |

## Troubleshooting

### Deployment fails with "Build failed"
- Check **Logs** tab in Pages dashboard
- Verify `npm run build` works locally: `npm run build`
- Check `functions/[[path]].ts` for errors

### Pages shows 404
- Ensure `functions/[[path]].ts` exists
- Verify build output directory is set to `build/client`
- Check that `build/server/index.js` exists after build

### Style or script not loading
- Clear cache: DevTools → Network tab → Disable cache, reload
- Check that assets are in `build/client/assets/`

### Custom domain not working
- Allow 24-48 hours for DNS propagation
- Verify DNS records in your registrar match Cloudflare settings
- Check that SSL certificate is active (should be automatic)

## Performance Tips

1. **Reduce bundle size**: Tree-shake unused dependencies
2. **Optimize images**: Compress before uploading
3. **Use caching**: Cloudflare automatically caches static assets
4. **Monitor metrics**: Check Pages Analytics for slowdowns

## Costs

- **Free Tier**: 100,000 requests/day, 500 builds/month
- **Paid**: $25/month for increased limits
- **Additional**: Any external services (database, storage) cost separately

## Environment Variables

For dynamic configuration in edge functions:

```toml
[env.production]
vars = { 
  ENV = "production",
  LOG_LEVEL = "info"
}
```

Access in your loader:

```typescript
const env = context.cloudflare.env.ENV;
```

## Next Steps

1. **Connect your Git repo** to enable auto-deployments
2. **Test the live deployment** at your `.pages.dev` URL
3. **Monitor performance** using Pages Analytics
4. **Add custom domain** when ready (optional)

## Useful Links

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Pages Functions](https://developers.cloudflare.com/pages/platform/functions/)
- [Remix + Pages Guide](https://remix.run/docs/en/main/guides/cloudflare-pages)
- [Wrangler CLI](https://developers.cloudflare.com/workers/cli-wrangler/)
