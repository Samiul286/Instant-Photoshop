# Vercel Deployment Guide

This guide will walk you through deploying your Next.js Passport Photo Pro application to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier available)
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- API keys for third-party services (see Environment Variables section)

## Quick Deploy

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect Your Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your Git repository
   - Vercel will automatically detect it's a Next.js project

2. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` or `bun run build`
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` or `bun install`

3. **Add Environment Variables**
   
   Click "Environment Variables" and add the following:

   ```
   REMOVE_BG_API_KEY=your_actual_api_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
   ```

   > **Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Keep sensitive keys without this prefix.

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-5 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts to link your project and deploy.

4. **Add Environment Variables**
   ```bash
   vercel env add REMOVE_BG_API_KEY
   vercel env add CLOUDINARY_CLOUD_NAME
   vercel env add CLOUDINARY_API_KEY
   vercel env add CLOUDINARY_API_SECRET
   vercel env add NEXT_PUBLIC_EMAILJS_SERVICE_ID
   vercel env add NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
   vercel env add NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Environment Variables Setup

### Required API Keys

1. **Remove.bg API Key**
   - Sign up at [remove.bg](https://www.remove.bg/api)
   - Get your API key from the dashboard
   - Add as `REMOVE_BG_API_KEY`

2. **Cloudinary Credentials**
   - Sign up at [cloudinary.com](https://cloudinary.com/)
   - Find credentials in your dashboard
   - Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

3. **EmailJS Configuration**
   - Sign up at [emailjs.com](https://www.emailjs.com/)
   - Create a service and template
   - Add `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`

### Adding Environment Variables in Vercel

1. Go to your project dashboard on Vercel
2. Navigate to "Settings" → "Environment Variables"
3. Add each variable with its value
4. Select environments: Production, Preview, Development
5. Click "Save"

## Important Configuration Notes

### Build Configuration

Your `next.config.ts` uses `output: "standalone"` which is optimized for self-hosting. For Vercel, you can optionally remove this line as Vercel handles optimization automatically:

```typescript
const nextConfig: NextConfig = {
  // output: "standalone", // Remove this for Vercel
  typescript: {
    ignoreBuildErrors: true, // Consider fixing TypeScript errors instead
  },
  reactStrictMode: false,
};
```

### Build Command Override

If you're using Bun and want to use it on Vercel:

1. Go to Project Settings → General
2. Set Build Command to: `bun run build`
3. Set Install Command to: `bun install`

> **Note**: Vercel supports Bun, but npm/pnpm are more commonly used and tested.

## Custom Domain Setup

1. Go to your project on Vercel
2. Navigate to "Settings" → "Domains"
3. Add your custom domain
4. Update your DNS records as instructed by Vercel
5. Wait for DNS propagation (can take up to 48 hours)

## Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to your main/master branch
- **Preview**: Every push to other branches and pull requests

### Disable Auto-Deploy (Optional)

1. Go to Project Settings → Git
2. Toggle "Production Branch" or "Preview Deployments" as needed

## Troubleshooting

### Build Fails

1. **Check build logs** in Vercel dashboard
2. **Test locally**: Run `npm run build` to catch errors
3. **TypeScript errors**: Your config ignores them, but fix them for better stability
4. **Missing dependencies**: Ensure all packages are in `package.json`

### Environment Variables Not Working

1. Ensure variables are added to the correct environment (Production/Preview)
2. Redeploy after adding new variables
3. Check variable names match exactly (case-sensitive)
4. For client-side variables, ensure they start with `NEXT_PUBLIC_`

### API Routes Failing

1. Check function logs in Vercel dashboard
2. Verify API keys are correctly set
3. Check for CORS issues if calling from external domains
4. Ensure API routes are in `src/app/api/` directory

### Image Optimization Issues

Next.js image optimization works automatically on Vercel. If you have issues:
1. Check image domains in `next.config.ts`
2. Verify Sharp is installed (it's in your dependencies)
3. Check Vercel function logs for errors

## Performance Optimization

### Enable Analytics

1. Go to your project dashboard
2. Navigate to "Analytics" tab
3. Enable Web Analytics (free)

### Edge Functions (Optional)

For better performance, consider using Edge Runtime for API routes:

```typescript
// In your API route
export const runtime = 'edge';
```

### Caching

Vercel automatically caches static assets. For API routes, add cache headers:

```typescript
export async function GET() {
  return new Response(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
    }
  });
}
```

## Monitoring

1. **Real-time Logs**: Vercel Dashboard → Your Project → Logs
2. **Analytics**: Track page views and performance
3. **Error Tracking**: Consider integrating Sentry or similar

## Rollback

If a deployment has issues:
1. Go to Deployments tab
2. Find a previous working deployment
3. Click "..." → "Promote to Production"

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/domains)

## Support

- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Community: [GitHub Discussions](https://github.com/vercel/next.js/discussions)

---

**Ready to deploy?** Click the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)

Replace `YOUR_REPO_URL` with your actual repository URL.
