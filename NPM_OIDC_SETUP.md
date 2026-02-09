# NPM OIDC Trusted Publishing Setup Guide

This guide explains how to configure NPM trusted publishing for the `contentful-rich-text-html-parser` package to enable automated releases from GitHub Actions.

## What Changed?

The automated release workflow has been updated to use **NPM's OIDC-based Trusted Publishing** instead of long-lived NPM tokens. This provides several benefits:

- 🔐 **More Secure**: No long-lived tokens to manage or rotate
- ✅ **Supply Chain Security**: Automatic provenance attestations for your packages
- 🎯 **Simpler Management**: No secrets to store in GitHub (except GITHUB_TOKEN)
- 📦 **Better Trust**: Users can verify that packages were built by GitHub Actions from your repository

## What You Need to Do

To enable automated releases with the new configuration, you need to configure trusted publishing on npmjs.com.

### Step 1: Log in to npm

1. Go to [npmjs.com](https://www.npmjs.com)
2. Log in with your account credentials

### Step 2: Navigate to Your Package Settings

1. Go to your package page: `https://www.npmjs.com/package/contentful-rich-text-html-parser`
2. Click on the "Settings" tab

### Step 3: Configure Trusted Publishing

1. Scroll down to the "Publishing access" section
2. Click on "Add publishing access"
3. Select **GitHub Actions** as the provider
4. Enter the following details:
   - **Repository owner**: `oleast`
   - **Repository name**: `contentful-rich-text-html-parser`
   - **Workflow file path**: `.github/workflows/release.yml`
   - **Environment** (optional): Leave blank unless you use GitHub Environments
5. Click "Add" or "Save"

### Step 4: Remove the Old NPM_TOKEN Secret (Optional but Recommended)

Since the workflow no longer uses the `NPM_TOKEN` secret, you can remove it from your GitHub repository:

1. Go to your GitHub repository: `https://github.com/oleast/contentful-rich-text-html-parser`
2. Click on "Settings"
3. In the left sidebar, click on "Secrets and variables" → "Actions"
4. Find the `NPM_TOKEN` secret
5. Click the trash icon to delete it

**Note**: Keep the `RELEASE_PAT` secret as it's still needed for GitHub releases.

## How It Works

When the release workflow runs on GitHub Actions:

1. GitHub generates a short-lived OIDC token for the workflow
2. npm verifies the token matches your configured trusted publisher settings
3. If verified, npm allows the package to be published with automatic provenance
4. The provenance attestation is published alongside your package, showing it was built by GitHub Actions

## Verifying Provenance

After a successful release, users can verify your package's provenance using:

```bash
npm audit signatures
```

This will show that the package was published from GitHub Actions and includes the commit SHA and workflow details.

## Troubleshooting

### "401 Unauthorized" Error

If you see a 401 error after configuring trusted publishing:

1. **Verify the configuration on npmjs.com matches exactly**:
   - Repository owner: `oleast`
   - Repository name: `contentful-rich-text-html-parser`
   - Workflow path: `.github/workflows/release.yml`

2. **Check the workflow permissions**: The workflow file should include:
   ```yaml
   permissions:
     id-token: write  # Required for OIDC
     contents: write  # Required for releases
   ```

3. **Ensure the workflow is running from the main branch**: Trusted publishing is configured for releases from the `main` branch.

### "Package not found" Error

Make sure you have publishing rights to the package on npm. You need to be either:
- The package owner
- A member of the organization that owns the package
- Listed as a maintainer with publish permissions

## Additional Resources

- [npm Trusted Publishers Documentation](https://docs.npmjs.com/generating-provenance-statements)
- [GitHub Actions OIDC Documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [semantic-release npm plugin Documentation](https://github.com/semantic-release/npm#trusted-publishing-from-github-actions)

## Questions?

If you encounter any issues during setup, please:
1. Check the workflow runs in GitHub Actions for detailed error messages
2. Verify your npm package settings match the configuration above
3. Open an issue if you need additional help
