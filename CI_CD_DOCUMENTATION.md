# CI/CD Pipeline Documentation

## Overview

This project uses GitHub Actions for continuous integration and continuous deployment (CI/CD). The pipeline automates testing, building, and deployment of both the backend (NestJS + Render) and frontend (Next.js + Vercel) applications.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Repository                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              GitHub Actions Workflows                    │  │
│  │                                                          │  │
│  │  ┌─────────────────┐  ┌─────────────────┐              │  │
│  │  │   CI Workflow   │  │  Manual Deploy  │              │  │
│  │  │  (every push)   │  │  (on-demand)    │              │  │
│  │  └────────┬────────┘  └────────┬────────┘              │  │
│  │           │                    │                        │  │
│  │  ┌────────▼────────────────────▼────────────────────┐  │  │
│  │  │  Backend Deploy (Render)                        │  │  │
│  │  │  • Lint & Type Check                            │  │  │
│  │  │  • Build NestJS                                 │  │  │
│  │  │  • Deploy to Render on push to main             │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Frontend Deploy (Vercel)                      │  │  │
│  │  │  • Lint & Type Check                           │  │  │
│  │  │  • Build Next.js                               │  │  │
│  │  │  • Preview on PRs                              │  │  │
│  │  │  • Deploy to production on push to main        │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
        │                           │
        ▼                           ▼
    ┌─────────┐            ┌──────────────┐
    │  Render │            │    Vercel    │
    │ Backend │            │   Frontend   │
    └─────────┘            └──────────────┘
```

## Workflow Files

### `.github/workflows/ci.yml` - Continuous Integration
**Runs on:** Every push to main/develop/feature/*, every pull request

**Jobs:**
- Lint backend code (ESLint)
- Lint frontend code (ESLint)
- Type check backend (TypeScript)
- Type check frontend (TypeScript)
- Security vulnerability scan
- Status check (aggregates results)

**Purpose:** Ensure code quality before deployment

---

### `.github/workflows/backend-deploy.yml` - Backend Deployment
**Runs on:** 
- All push/PR to main/develop (for testing)
- Deploys to Render only on push to `main`

**Jobs:**
- Test & Build Backend
  - Install dependencies (with legacy peer deps flag)
  - Run linter
  - Build TypeScript
  - Verify dist output
- Deploy to Render
  - Trigger deployment hook
  - Wait for Render to start build
- Notify on failure

**Environment Variables (must be set on Render):**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV=production`
- `HOST=0.0.0.0`
- `FRONTEND_URL` (optional)
- `CORS_ORIGINS` (optional)
- `ALLOW_VERCEL_ORIGINS=true` (default)

---

### `.github/workflows/frontend-deploy.yml` - Frontend Deployment
**Runs on:**
- All push/PR to main/develop (for testing)
- Deploys to Vercel on push to `main` (production)
- Creates previews on pull requests

**Jobs:**
- Test & Build Frontend
  - Install dependencies
  - Run linter
  - Build Next.js with API URL
  - Verify .next output
  - Upload artifacts
- Deploy to Vercel (production on main)
- Preview Deployment (on pull requests)
- Notify on failure

**GitHub Secrets Required:**
- `VERCEL_TOKEN` - Authentication token
- `VERCEL_ORG_ID` - Organization ID
- `VERCEL_PROJECT_ID` - Project ID
- `NEXT_PUBLIC_API_URL` (optional) - Backend API URL

---

### `.github/workflows/manual-deploy.yml` - Manual Deployment
**Triggers:** Manual dispatch from GitHub Actions tab

**Options:**
- Service: backend, frontend, or both
- Environment: production or staging

**Purpose:** Deploy without pushing code changes (hotfixes, emergency updates, etc.)

---

### `.github/dependabot.yml` - Dependency Updates
**Runs:** Weekly on Mondays (backend/frontend) and Tuesdays (GitHub Actions)

**Features:**
- Automatic pull requests for new updates
- Grouped dependency updates
- Ignores major version updates for review
- Configurable review schedule

---

## Initial Setup (Step by Step)

### 1. Add GitHub Secrets

Go to repository **Settings → Secrets and variables → Actions** and add:

**For Backend (Render):**
```
RENDER_DEPLOY_HOOK_URL = https://api.render.com/deploy/srv-...
```

Get this from: Render Dashboard → Service → Settings → Deploy Hook

**For Frontend (Vercel):**
```
VERCEL_TOKEN = your_token_here
VERCEL_ORG_ID = your_org_id
VERCEL_PROJECT_ID = your_project_id
NEXT_PUBLIC_API_URL = https://arorano-backend.onrender.com (optional)
```

Get these from:
- `VERCEL_TOKEN`: https://vercel.com/account/tokens (create new token)
- `VERCEL_ORG_ID`: Run `vercel whoami` in frontend directory
- `VERCEL_PROJECT_ID`: Run `vercel project inspect` in frontend directory

### 2. Configure Environment Variables

**On Render Dashboard:**
1. Go to your backend service
2. Click Settings → Environment
3. Ensure these are set:
   - `NODE_ENV=production`
   - `DATABASE_URL=...` (PostgreSQL connection)
   - `JWT_SECRET=...` (generate a strong one)
   - `HOST=0.0.0.0`

**On Vercel Dashboard:**
1. Go to your frontend project (arorano)
2. Click Settings → Environment Variables
3. Add `NEXT_PUBLIC_API_URL=https://arorano-backend.onrender.com`

### 3. Verify Workflows

1. Push code to a branch or create a PR
2. Go to repository **Actions** tab
3. See workflows running:
   - CI workflow should run on all branches
   - Backend deployment on main only
   - Frontend deployment on main only

## Usage

### Automatic Deployments

**On push to `main`:**
```bash
git push origin main
```

Then:
1. CI workflow runs (linting, type checks, security scan)
2. Backend builds and deploys to Render
3. Frontend builds and deploys to Vercel
4. Check Actions tab for status

**On pull request:**
1. CI workflow runs on all changes
2. Frontend creates a preview deployment (link shown in PR)
3. Backend creates a preview build (check Render dashboard)
4. Can merge once checks pass

### Manual Deployment

1. Go to repository **Actions** tab
2. Click **Manual Deploy** workflow on the left
3. Click **Run workflow**
4. Select:
   - Service: backend, frontend, or both
   - Environment: production (staging not yet deployed)
5. Click **Run workflow**
6. Monitor the deployment in the workflow logs

### Updating Dependencies

1. Dependabot creates pull requests weekly for updates
2. Review the changes in the PR
3. Tests run automatically
4. Merge if all checks pass
5. Deployment happens automatically

## Monitoring

### In GitHub

1. Go to **Actions** tab
2. View workflow runs:
   - Green checkmark = success
   - Red X = failure
   - Yellow circle = running
3. Click on a workflow to see detailed logs

### In Render

1. Go to https://dashboard.render.com
2. Select your backend service
3. Click **Events** tab to see:
   - Deployment history
   - Build logs
   - Any errors

### In Vercel

1. Go to https://vercel.com/dashboard
2. Select the "arorano" project
3. Click **Deployments** to see:
   - Current production deployment
   - Previous deployments
   - Preview deployments
   - Deployment status and logs

## Troubleshooting

### Backend Deployment Failed

**Error: `rimraf: not found`**
- Already fixed in package.json `prebuild` script
- If issue persists, regenerate: `npm install --legacy-peer-deps --include=dev` locally

**Error: `RENDER_DEPLOY_HOOK_URL not configured`**
- Add the secret to GitHub: Settings → Secrets → New secret
- Name: `RENDER_DEPLOY_HOOK_URL`
- Value: Paste from Render dashboard

**Error: TypeScript compilation errors**
- Run locally: `cd backend && npm install --legacy-peer-deps --include=dev && npm run build`
- Fix errors shown
- Push to fix

### Frontend Deployment Failed

**Error: `VERCEL_TOKEN not configured`**
- Generate token: https://vercel.com/account/tokens
- Add to GitHub secrets

**Error: `VERCEL_PROJECT_ID not configured`**
- Run: `cd frontend && vercel project inspect`
- Copy the ID shown
- Add to GitHub secrets

**Error: Build fails with API URL issues**
- Check `NEXT_PUBLIC_API_URL` environment variable
- Should be: `https://arorano-backend.onrender.com`
- Update in Vercel project settings if needed

### CI Checks Failing

**ESLint errors:**
```bash
# Run locally to see errors
cd backend  # or cd frontend
npm run lint
```

**TypeScript errors:**
```bash
# Run locally to see errors
cd backend  # or cd frontend
npx tsc --noEmit
```

Fix the issues, push again, and checks will re-run.

## Best Practices

1. **Always test locally** before pushing:
   ```bash
   cd backend && npm run build
   cd ../frontend && npm run build
   ```

2. **Use feature branches** for development:
   ```bash
   git checkout -b feature/my-feature
   git push origin feature/my-feature
   # Create PR when ready
   ```

3. **Review PR checks** before merging:
   - All workflows must pass (green checkmarks)
   - Preview deployment must work
   - Code review should be approved

4. **Check logs for warnings** even if deployment succeeds:
   - Go to Actions → Workflow → Job details
   - Look for any warnings or deprecations
   - Fix before they become errors

5. **Keep dependencies updated**:
   - Review Dependabot PRs weekly
   - Test before merging
   - Merge to keep security patches current

6. **Use manual deploy for emergencies**:
   - Only when automatic deployment not needed
   - Good for hotfixes without full git workflow

## Performance Optimization

### Build Time Optimization

**Backend:**
- Building takes ~2-3 minutes
- Cached node_modules speeds up installations
- TypeScript compilation is the main bottleneck

**Frontend:**
- Next.js build takes ~3-5 minutes
- Static generation speeds production build
- Image optimization adds time but improves performance

### Storage Optimization

- Artifacts deleted after 1 day to save space
- Build caches maintained for week
- Old workflow runs can be deleted from Actions tab

## Security Considerations

1. **Secrets Management:**
   - Never commit secrets to the repository
   - Use GitHub Secrets for all credentials
   - Rotate tokens periodically

2. **Branch Protection:**
   - Configure main branch to require PR reviews
   - Require status checks to pass
   - Dismiss stale PR approvals

3. **Audit Dependencies:**
   - Run `npm audit` in CI
   - Review security warnings
   - Update vulnerable packages immediately

## Disabling Features

### Disable Auto-Deploy on Merge
In `.github/workflows/backend-deploy.yml` or `frontend-deploy.yml`:
```yaml
if: github.ref == 'refs/heads/main' && github.event_name == 'push'
# Change to:
if: false  # Disables deployment
```

### Disable Dependabot
In `.github/dependabot.yml`:
```yaml
# Comment out or delete the configuration
# or delete the file entirely
```

### Disable Manual Deployment
In `.github/workflows/manual-deploy.yml`:
- Rename to `.manual-deploy.yml.disabled`
- Or delete the file

## Advanced Configuration

### Running Tests

To add automated testing to CI:

**Backend:**
```yaml
- name: Run tests
  working-directory: backend
  run: npm run test --if-present
```

**Frontend:**
```yaml
- name: Run tests
  working-directory: frontend
  run: npm run test --if-present
```

### Adding Code Coverage

Integrate with Codecov:
```yaml
- uses: codecov/codecov-action@v3
  with:
    files: ./coverage/cobertura-coverage.xml
```

### Slack Notifications

Use `slackapi/slack-github-action`:
```yaml
- name: Slack notification
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Render Deploy Hooks](https://render.com/docs/deploy-hooks)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)
- [NestJS Build Optimization](https://docs.nestjs.com/deployment)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## Support

For issues with the CI/CD pipeline:

1. Check workflow logs in GitHub Actions tab
2. Verify all secrets are configured correctly
3. Run commands locally to reproduce issues
4. Check service-specific dashboards (Render, Vercel)
5. Review this documentation for common issues
