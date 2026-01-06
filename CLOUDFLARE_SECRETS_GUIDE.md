# Cloudflare Secrets Configuration Guide

## What Changed in the Workflow

I've updated your `.github/workflows/master.yml` to safely debug and validate your Cloudflare configuration:

### 1. **Validate Secrets Step**
This step checks if all required secrets are set WITHOUT exposing them:
- ✅ Shows that secrets exist
- ✅ Shows the length of secrets (to verify they're not empty)
- ✅ Shows CLOUDFLARE_PROJECT_NAME (safe to display, not sensitive)
- ❌ Does NOT expose CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID

### 2. **List Cloudflare Pages Projects Step**
This step lists all your existing Cloudflare Pages projects:
- Helps you verify the correct project name
- Shows if your API token and account ID are working
- Displays what projects you have access to

## Required GitHub Secrets

You need to configure these secrets in your GitHub repository:

### Where to Add Secrets
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each secret below

### Required Secrets

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `CLOUDFLARE_API_TOKEN` | API token with Pages permissions | [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) → Create Token → "Edit Cloudflare Workers" template |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | [Cloudflare Dashboard](https://dash.cloudflare.com/) → Click any site → Copy from right sidebar |
| `CLOUDFLARE_PROJECT_NAME` | Your Cloudflare Pages project name | [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages → Your project name |

## How to Get Your Cloudflare Project Name

### Option 1: Check Existing Projects
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages**
3. Click the **Pages** tab
4. Copy the exact name of your existing project

### Option 2: Use the Workflow to List Projects
1. Run the workflow with the new changes
2. Check the **"List Cloudflare Pages Projects"** step output
3. It will show all your existing projects
4. Copy the exact project name you want to use

## What the Workflow Output Will Show

When you run the workflow, you'll see:

```
🔍 Validating Cloudflare configuration...
✅ CLOUDFLARE_API_TOKEN is set (length: 40)
✅ CLOUDFLARE_ACCOUNT_ID is set (length: 32)
✅ CLOUDFLARE_PROJECT_NAME is set: your-project-name
✅ All secrets are configured
```

Then in the "List Cloudflare Pages Projects" step:
```
┌─────────────────────┬──────────────────────────┬─────────────┐
│ Project Name        │ Production URL           │ Created     │
├─────────────────────┼──────────────────────────┼─────────────┤
│ your-project-name   │ https://your-proj.pages. │ 2026-01-01  │
│ another-project     │ https://another.pages... │ 2026-01-02  │
└─────────────────────┴──────────────────────────┴─────────────┘
```

## Troubleshooting

### Error: "CLOUDFLARE_API_TOKEN is not set"
- Secret is missing or misspelled in GitHub
- Add it in Settings → Secrets and variables → Actions

### Error: "Project not found" (code: 8000007)
- The `CLOUDFLARE_PROJECT_NAME` doesn't match any existing project
- Check the output of "List Cloudflare Pages Projects" step
- Update the secret with the exact project name (case-sensitive)

### Error: "Authentication error"
- `CLOUDFLARE_API_TOKEN` is invalid or expired
- `CLOUDFLARE_ACCOUNT_ID` is incorrect
- Regenerate API token with proper permissions

### Error: "Insufficient permissions"
- API token doesn't have "Cloudflare Pages:Edit" permission
- Create a new token with the "Edit Cloudflare Workers" template

## Security Best Practices

✅ **DO:**
- Store secrets in GitHub repository secrets
- Use scoped API tokens (not Global API Key)
- Rotate API tokens periodically
- Limit token permissions to only what's needed

❌ **DON'T:**
- Print secrets in logs (even GitHub masks them, it's risky)
- Commit secrets to git
- Share API tokens
- Use the same token across multiple projects

## Next Steps

1. **Verify your secrets are set correctly** in GitHub
2. **Run the workflow** to see the validation and project list
3. **Check the output** to confirm your project name matches
4. **Update `CLOUDFLARE_PROJECT_NAME`** if needed based on the list
5. **Deploy successfully!** 🚀

## Alternative: Create New Project

If you want to create a new project instead of using an existing one:

1. Choose a new project name (e.g., `flats-manager`)
2. Set `CLOUDFLARE_PROJECT_NAME` to the new name
3. The deployment will automatically create the project on first deploy

Or manually create it:
```bash
npx wrangler pages project create flats-manager --production-branch=master
```

