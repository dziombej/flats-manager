# Quick Reference: Debugging Secrets in GitHub Actions

## ✅ Safe Way to Debug Secrets (Current Implementation)

### 1. Check if Secrets Exist
```yaml
- name: Validate Secrets
  run: |
    if [ -z "${{ secrets.MY_SECRET }}" ]; then
      echo "❌ MY_SECRET is not set"
      exit 1
    else
      echo "✅ MY_SECRET is set (length: ${#MY_SECRET})"
    fi
  env:
    MY_SECRET: ${{ secrets.MY_SECRET }}
```

**Shows:**
- ✅ Whether secret exists
- ✅ Length of the secret
- ❌ Does NOT show the actual value

### 2. Test API Connectivity
```yaml
- name: List Cloudflare Pages Projects
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    command: pages project list
```

**Shows:**
- ✅ If authentication works
- ✅ What projects you have access to
- ✅ Proper project names to use

## ❌ Unsafe Ways (Never Do This)

### Never Print Secrets Directly
```yaml
# ❌ BAD - Even though GitHub masks secrets, this is risky
- name: Print Secret
  run: echo "${{ secrets.MY_SECRET }}"

# ❌ BAD - Can expose secrets if masking fails
- name: Print Secret
  run: |
    echo "Token: ${{ secrets.CLOUDFLARE_API_TOKEN }}"
```

## What Your Workflow Will Show

### Validation Step Output:
```
🔍 Validating Cloudflare configuration...
✅ CLOUDFLARE_API_TOKEN is set (length: 40)
✅ CLOUDFLARE_ACCOUNT_ID is set (length: 32)
✅ CLOUDFLARE_PROJECT_NAME is set: flats-manager
✅ All secrets are configured
```

### List Projects Step Output:
```
📋 Listing your Cloudflare Pages projects...
┌─────────────────────┬──────────────────────────┐
│ Project Name        │ Production URL           │
├─────────────────────┼──────────────────────────┤
│ flats-manager       │ https://flats-mgr.pages. │
│ another-app         │ https://another.pages... │
└─────────────────────┴──────────────────────────┘
```

## Common Issues and Solutions

### "Secret not set" Error
**Problem:** Secret shows as not set in workflow
**Solution:** 
1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Verify secret name matches exactly (case-sensitive)
3. Re-add the secret if needed

### "Project not found" Error
**Problem:** Project name doesn't match
**Solution:**
1. Check "List Cloudflare Pages Projects" step output
2. Copy exact project name (case-sensitive)
3. Update `CLOUDFLARE_PROJECT_NAME` secret

### "Authentication error"
**Problem:** API token or account ID is wrong
**Solution:**
1. Verify token has "Cloudflare Pages:Edit" permissions
2. Check account ID from Cloudflare dashboard
3. Regenerate token if needed

## How to Get Your Project Name

1. **Run the updated workflow** - It will list all your projects
2. **Check the output** of "List Cloudflare Pages Projects" step
3. **Copy the exact name** and update the secret if needed

## Security Reminder

- ✅ Secrets are safely validated without exposure
- ✅ GitHub Actions masks secrets in logs
- ✅ But always prefer NOT printing them at all
- ✅ Use API calls to test credentials instead

