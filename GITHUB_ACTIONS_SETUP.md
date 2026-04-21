# GitHub Actions CI/CD Setup Guide

This guide explains how to configure GitHub Secrets and set up the CI/CD pipeline for the AroRano project.

## Overview

The CI/CD pipeline consists of three workflows:

1. **CI Workflow** (`ci.yml`) - Runs on every push and pull request
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Security vulnerability scans
   - Triggered on: push to main/develop/feature/*, pull requests

2. **Backend Deployment** (`backend-deploy.yml`) - Deploys to Render
   - Builds and tests the NestJS backend
   - Deploys to Render on push to main
   - Triggered on: push to main/develop with backend changes

3. **Frontend Deployment** (`frontend-deploy.yml`) - Deploys to Vercel
   - Builds and tests the Next.js frontend
   - Creates preview deployments on pull requests
   - Deploys to production on push to main
   - Triggered on: push to main/develop with frontend changes

## Required GitHub Secrets

Add these secrets to your GitHub repository:

### For Backend Deployment (Render)

**1. `RENDER_DEPLOY_HOOK_URL`**
- What: URL to trigger deployments on your Render service
- How to get:
  1. Go to your Render dashboard: https://dashboard.render.com
  2. Select your backend service
  3. Go to **Settings** → **Deploy Hook**
  4. Copy the webhook URL (it will look like `https://api.render.com/deploy/srv-...`)
  5. Add to GitHub Secrets: Settings → Secrets and variables → Actions → New repository secret

**Example hook URL format:**
```
https://api.render.com/deploy/srv-xxxxxxxxxxxxxxxxxxxxxxxx?key=xxxxxxxxxxxxxx
```

### For Frontend Deployment (Vercel)

**1. `VERCEL_TOKEN`**
- What: Authentication token for Vercel CLI
- How to get:
  1. Go to Vercel account settings: https://vercel.com/account/tokens
  2. Click "Create Token"
  3. Name it "GitHub Actions"
  4. Set expiration (e.g., 90 days)
  5. Copy the token (save it securely)
  6. Add to GitHub Secrets

**2. `VERCEL_ORG_ID`**
- What: Your Vercel organization ID
- How to get:
  1. Run: `vercel whoami` (if you're in the frontend directory)
  2. Or go to Vercel dashboard and check your project settings
  3. Add to GitHub Secrets

**3. `VERCEL_PROJECT_ID`**
- What: Project ID for the "arorano" frontend project
- How to get:
  1. In the frontend directory, run: `vercel project inspect`
  2. Or check Vercel dashboard → Project Settings → ID
  3. Look for the field showing the project ID
  4. Add to GitHub Secrets

**4. `NEXT_PUBLIC_API_URL` (Optional)**
- What: Backend API URL for the frontend to use
- Default: `https://arorano-backend.onrender.com`
- How to set:
  1. If you want a different backend URL, add this secret
  2. Otherwise, the default will be used

## Step-by-Step Setup

### 1. Get Render Deploy Hook

```bash
# On your local machine, in the project directory
# The hook URL is displayed in Render dashboard:
# Service → Settings → Deploy Hook
```

### 2. Get Vercel Credentials

```bash
# From the frontend directory
cd frontend

# Get organization and project IDs
vercel whoami          # Shows your org
vercel project inspect # Shows project details including ID
```

### 3. Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret:
   - Name: `RENDER_DEPLOY_HOOK_URL`, Value: `https://api.render.com/deploy/srv-...`
   - Name: `VERCEL_TOKEN`, Value: `your_token_here`
   - Name: `VERCEL_ORG_ID`, Value: `your_org_id`
   - Name: `VERCEL_PROJECT_ID`, Value: `your_project_id`

## Workflow Triggers

### CI Workflow (Always Runs)
- **On**: Every push to main/develop/feature/* branches
- **On**: Every pull request to main/develop
- **Purpose**: Code quality checks before deployment

### Backend Deployment
- **On**: Push to `main` branch with backend changes
- **Auto-deploys**: To Render production
- **Check logs**: GitHub Actions tab in your repository

### Frontend Deployment
- **Production**: Push to `main` branch with frontend changes
- **Preview**: On pull requests (for testing before merge)
- **Check logs**: GitHub Actions tab in your repository

## Monitoring Deployments

### In GitHub
1. Go to your repository
2. Click **Actions** tab
3. See workflow runs and their status
4. Click on a workflow to see detailed logs

### In Render
1. Go to https://dashboard.render.com
2. Select your backend service
3. Click **Events** to see deployment history

### In Vercel
1. Go to https://vercel.com/dashboard
2. Select the "arorano" project
3. Click **Deployments** to see deployment history
4. Preview URLs are shown for pull request deployments

## Troubleshooting

### Backend Deployment Failed
1. Check if `RENDER_DEPLOY_HOOK_URL` is correct
2. Verify the webhook URL hasn't expired (Render regenerates them)
3. Check Render dashboard for deployment errors
4. Run locally to verify build works: `cd backend && npm install --legacy-peer-deps --include=dev && npm run build`

### Frontend Deployment Failed
1. Verify `VERCEL_TOKEN` is valid (hasn't expired)
2. Check `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are correct
3. Ensure frontend builds locally: `cd frontend && npm install && npm run build`
4. Check that `NEXT_PUBLIC_API_URL` matches your Render backend URL

### Type Check Failures
- Backend: Run `cd backend && npx tsc --noEmit`
- Frontend: Run `cd frontend && npm run type-check`

### Linting Failures
- Backend: Run `cd backend && npm run lint`
- Frontend: Run `cd frontend && npm run lint`

## Disabling/Modifying Workflows

### Temporarily Disable
1. Go to **Actions** tab
2. Click the workflow name
3. Click **...** → **Disable workflow**

### Modify Triggers
- Edit `.github/workflows/*.yml` files
- Change `on:` section to customize triggers
- See [GitHub Actions documentation](https://docs.github.com/en/actions/using-workflows/triggering-a-workflow)

## Best Practices

1. **Keep secrets secure**: Never commit `.env` or secrets to the repository
2. **Rotate tokens**: Regenerate Vercel tokens periodically
3. **Monitor deployments**: Check GitHub Actions regularly for failures
4. **Test locally**: Always test changes locally before pushing
5. **Use branches**: Create feature branches before making changes
6. **Review PRs**: Have reviews before merging to main

## Environment Variables

### Backend (Render)
These should already be set in Render environment:
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - JWT signing key
- `NODE_ENV=production`
- `HOST=0.0.0.0`
- `FRONTEND_URL` - Frontend URL (optional)
- `CORS_ORIGINS` - Allowed CORS origins (optional)
- `ALLOW_VERCEL_ORIGINS=true` - Allow Vercel domains (default)

### Frontend (Vercel)
These should be set in Vercel project settings:
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Render Deploy Hooks](https://render.com/docs/deploy-hooks)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)

## Disabling Automatic Deployments

If you want to deploy manually instead of automatically:

1. Change deployment workflows to trigger manually:
```yaml
on:
  workflow_dispatch:  # Manual trigger instead of push
```

2. Then trigger from GitHub Actions tab: **Actions** → Select workflow → **Run workflow**
