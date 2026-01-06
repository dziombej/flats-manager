# 🚀 Cloudflare Pages Deployment - Pre-Flight Checklist

Use this checklist before deploying to Cloudflare Pages for the first time.

## ✅ Pre-Deployment Checklist

### 1. Local Environment
- [ ] Run `npm run build:cloudflare` successfully
- [ ] Verify adapter output shows: `adapter: @astrojs/cloudflare`
- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run test:coverage` - all tests pass

### 2. Cloudflare Setup
- [ ] Cloudflare Pages project created
- [ ] Project name noted (exact match required)
- [ ] Cloudflare API Token created with Pages permissions
- [ ] Cloudflare Account ID copied

### 3. GitHub Repository Setup
- [ ] Secret `CLOUDFLARE_API_TOKEN` added
- [ ] Secret `CLOUDFLARE_ACCOUNT_ID` added
- [ ] Secret `CLOUDFLARE_PROJECT_NAME` added
- [ ] Production environment created (optional but recommended)

### 4. Workflow Validation
- [ ] File `.github/workflows/master.yml` exists
- [ ] Workflow triggers on push to `master` branch
- [ ] All action versions are up to date (v6, v3)
- [ ] No syntax errors in YAML

### 5. First Deployment Test
- [ ] Push to `master` branch or manually trigger workflow
- [ ] Check GitHub Actions for workflow progress
- [ ] Verify all jobs complete successfully:
  - [ ] Lint Code ✅
  - [ ] Unit Tests ✅
  - [ ] Deploy to Cloudflare Pages ✅
  - [ ] Deployment Status ✅

### 6. Post-Deployment Verification
- [ ] Cloudflare Pages shows successful deployment
- [ ] Production URL is accessible
- [ ] Application functions correctly on Cloudflare
- [ ] Check Cloudflare analytics/logs

## 🧪 Quick Test Commands

### Test Cloudflare Build Locally
```bash
npm run build:cloudflare
```

Expected output includes:
```
[build] adapter: @astrojs/cloudflare
[build] ✓ Completed in XXXms.
```

### Test Regular Build (Node.js)
```bash
npm run build
```

Expected output includes:
```
[build] adapter: @astrojs/node
[build] ✓ Completed in XXXms.
```

### Run All Tests
```bash
npm run lint && npm run test:coverage
```

## 🔧 Troubleshooting Common Issues

### Issue: Build uses wrong adapter

**Symptom**: Shows `adapter: @astrojs/node` instead of `adapter: @astrojs/cloudflare`

**Solution**: Ensure `CF_PAGES=true` is set:
```bash
CF_PAGES=true npm run build
# or
npm run build:cloudflare
```

### Issue: "Project not found" error

**Symptom**: Deployment fails with project not found

**Solution**: 
1. Verify `CLOUDFLARE_PROJECT_NAME` matches exactly (case-sensitive)
2. Ensure project exists in Cloudflare Dashboard

### Issue: Authentication failed

**Symptom**: Deployment fails with 401/403 errors

**Solution**:
1. Regenerate Cloudflare API Token
2. Ensure token has "Cloudflare Pages - Edit" permission
3. Update `CLOUDFLARE_API_TOKEN` secret in GitHub

### Issue: Workflow doesn't trigger

**Symptom**: No workflow runs when pushing to master

**Solution**:
1. Check workflow file is in `.github/workflows/master.yml`
2. Ensure YAML is valid (no syntax errors)
3. Verify branch name is exactly `master`

## 📊 Monitoring Your Deployment

### GitHub Actions
- URL: `https://github.com/{owner}/{repo}/actions`
- Check: Workflow runs, job status, logs, artifacts

### Cloudflare Dashboard
- URL: `https://dash.cloudflare.com/`
- Navigate to: Workers & Pages → Your Project
- Check: Deployment history, logs, analytics

## 🎯 Success Criteria

Your deployment is successful when:

1. ✅ GitHub Actions workflow completes without errors
2. ✅ All jobs show green checkmarks
3. ✅ Cloudflare Dashboard shows "Active" deployment
4. ✅ Production URL is accessible and functional
5. ✅ No runtime errors in Cloudflare logs

## 📝 Next Steps After First Deployment

1. **Set up custom domain** (optional)
   - Cloudflare Dashboard → Your Project → Custom domains
   - Add your domain and configure DNS

2. **Configure environment variables** (if needed)
   - Cloudflare Dashboard → Your Project → Settings → Environment variables
   - Add any production environment variables

3. **Enable Preview Deployments** (optional)
   - Configure preview deployments for pull requests
   - Useful for testing before merging

4. **Set up monitoring**
   - Enable Cloudflare Web Analytics
   - Set up alerts for deployment failures

## 📚 Documentation References

- **Setup Guide**: `CLOUDFLARE_DEPLOYMENT.md` - Full documentation
- **Quick Summary**: `CLOUDFLARE_SETUP_SUMMARY.md` - Quick reference
- **This Checklist**: `CLOUDFLARE_CHECKLIST.md` - Pre-flight checklist

---

**Ready for takeoff!** 🚀 Good luck with your deployment!

