# Cloudflare Pages Deployment Setup

## Overview

This document describes the Cloudflare Pages deployment setup for the flats-manager project. The deployment is automated through GitHub Actions and triggers on every push to the `master` branch.

## Tech Stack

- **Astro 5** - Static Site Generator with Server-Side Rendering
- **Cloudflare Pages** - Hosting Platform
- **Cloudflare Adapter** - `@astrojs/cloudflare` for Astro
- **Node.js** - Runtime Environment (v22.14.0 as per .nvmrc)

## Project Configuration

### 1. Astro Configuration (`astro.config.mjs`)

The Astro configuration dynamically selects the appropriate adapter based on the `CF_PAGES` environment variable:

- **Local Development**: Uses `@astrojs/node` adapter
- **Cloudflare Pages**: Uses `@astrojs/cloudflare` adapter when `CF_PAGES=true`

```javascript
adapter: process.env.CF_PAGES
  ? cloudflare({ platformProxy: { enabled: true } })
  : node({ mode: "standalone" })
```

### 2. Dependencies

The Cloudflare adapter has been installed as a dev dependency:

```bash
npm install @astrojs/cloudflare --save-dev
```

## GitHub Actions Workflow

### Workflow File: `.github/workflows/master.yml`

The deployment workflow consists of four jobs:

#### Job 1: Lint Code
- Checks out the repository
- Sets up Node.js (using version from `.nvmrc`)
- Installs dependencies with `npm ci`
- Runs ESLint to ensure code quality

#### Job 2: Unit Tests
- Runs after successful linting
- Executes unit tests with coverage
- Uploads test coverage reports as artifacts
- Uploads test results on failure for debugging

#### Job 3: Deploy to Cloudflare Pages
- Runs after successful linting and testing
- Uses the `production` environment
- Sets `CF_PAGES=true` to enable Cloudflare adapter
- Builds the project with Cloudflare adapter
- Deploys to Cloudflare Pages using `wrangler-action@v3`

#### Job 4: Status Notification
- Runs after all jobs complete
- Reports deployment success or failure
- Always executes (even if previous jobs fail)

### Workflow Triggers

The workflow triggers on:
- **Push to master branch**: Automatic deployment
- **Manual dispatch**: Can be triggered manually from GitHub Actions UI

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository:

### Settings → Secrets and Variables → Actions → Repository Secrets

1. **CLOUDFLARE_API_TOKEN**
   - Your Cloudflare API Token with Pages permissions
   - Create at: https://dash.cloudflare.com/profile/api-tokens
   - Required permissions: `Cloudflare Pages - Edit`

2. **CLOUDFLARE_ACCOUNT_ID**
   - Your Cloudflare Account ID
   - Find at: https://dash.cloudflare.com/ (in the URL or right sidebar)

3. **CLOUDFLARE_PROJECT_NAME**
   - The name of your Cloudflare Pages project
   - Must match the project name in Cloudflare Dashboard

## Setup Instructions

### Step 1: Create Cloudflare Pages Project

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages**
3. Click **Create Application** → **Pages** → **Connect to Git**
4. Select your GitHub repository
5. Configure build settings:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. Click **Save and Deploy**

### Step 2: Get Cloudflare Credentials

#### API Token
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Use **Edit Cloudflare Workers** template
4. Add **Cloudflare Pages - Edit** permission
5. Copy the generated token

#### Account ID
1. Go to https://dash.cloudflare.com/
2. Select your account
3. Copy the Account ID from the URL or right sidebar

#### Project Name
1. Go to **Workers & Pages**
2. Find your project
3. Copy the exact project name

### Step 3: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the three required secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_PROJECT_NAME`

### Step 4: Configure Production Environment (Optional)

For better deployment control, create a production environment:

1. Go to **Settings** → **Environments**
2. Click **New environment**
3. Name it `production`
4. Configure protection rules (optional):
   - Required reviewers
   - Wait timer
   - Deployment branches (restrict to `master` only)

## Testing the Setup

### Local Build Test

Test the build with Cloudflare adapter locally:

```bash
CF_PAGES=true npm run build
```

Expected output should show:
```
[build] adapter: @astrojs/cloudflare
```

### Manual Workflow Trigger

1. Go to **Actions** tab in your repository
2. Select **Deploy to Cloudflare Pages** workflow
3. Click **Run workflow**
4. Select `master` branch
5. Click **Run workflow**

## Deployment Process

When you push to the `master` branch:

1. **Code Quality Check** (Lint)
   - ESLint runs to check code quality
   - Fails if there are linting errors

2. **Testing** (Unit Tests)
   - Vitest runs all unit tests with coverage
   - Coverage reports are uploaded as artifacts
   - Fails if tests don't pass

3. **Build & Deploy**
   - Project is built with Cloudflare adapter (`CF_PAGES=true`)
   - Built files are deployed to Cloudflare Pages
   - Deployment uses Wrangler CLI via `cloudflare/wrangler-action@v3`

4. **Status Notification**
   - Reports deployment success or failure
   - Always runs regardless of previous job results

## Action Versions

All GitHub Actions use the latest major versions:

- `actions/checkout@v6` - Latest: v6.0.1
- `actions/setup-node@v6` - Latest: v6.1.0
- `actions/upload-artifact@v6` - Latest: v6.0.0
- `cloudflare/wrangler-action@v3` - Latest: v3.14.1

These versions are verified and not archived.

## Troubleshooting

### Build Fails

**Problem**: Build fails with adapter errors

**Solution**: Ensure `CF_PAGES=true` is set in the build step:
```yaml
- name: Build Project
  run: npm run build
  env:
    CF_PAGES: true
```

### Deployment Fails

**Problem**: Deployment fails with authentication errors

**Solutions**:
1. Verify `CLOUDFLARE_API_TOKEN` has correct permissions
2. Check `CLOUDFLARE_ACCOUNT_ID` is correct
3. Ensure `CLOUDFLARE_PROJECT_NAME` matches exactly

**Problem**: Deployment fails with "Project not found"

**Solution**: Create the Cloudflare Pages project first (Step 1 above)

### Wrong Adapter Used

**Problem**: Build uses Node.js adapter instead of Cloudflare

**Solution**: Ensure `CF_PAGES=true` environment variable is set:
```bash
CF_PAGES=true npm run build
```

### Tests Fail

**Problem**: Unit tests fail during CI

**Solution**: 
1. Run tests locally: `npm run test:coverage`
2. Fix failing tests
3. Commit and push changes

## Environment Variables

The workflow uses the following environment variables:

- `CF_PAGES=true` - Enables Cloudflare adapter during build
- `NODE_ENV` - Automatically set by CI environment

## Build Output

After successful build with Cloudflare adapter:

- Build directory: `dist/`
- Cloudflare Pages deploys everything in this directory
- Server-side rendering is supported via Cloudflare Workers

## Monitoring Deployments

### GitHub Actions
- View deployment logs in **Actions** tab
- Download artifacts (coverage reports, test results)
- Check job status and duration

### Cloudflare Dashboard
- View deployment history in **Workers & Pages** → Your Project
- Check deployment status, build logs, and URLs
- Monitor analytics and performance

## Additional Resources

- [Astro Cloudflare Adapter Documentation](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler Action Documentation](https://github.com/cloudflare/wrangler-action)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Summary

✅ **Cloudflare adapter installed**: `@astrojs/cloudflare`  
✅ **Astro config updated**: Dynamic adapter selection  
✅ **GitHub Actions workflow created**: `.github/workflows/master.yml`  
✅ **Action versions verified**: All using latest major versions  
✅ **No E2E tests in workflow**: As requested  
✅ **Build tested locally**: Works with `CF_PAGES=true`  

The project is now ready for Cloudflare Pages deployment!

