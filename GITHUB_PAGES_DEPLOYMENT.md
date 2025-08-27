# GitHub Pages Deployment

This document explains how the GitHub Pages deployment is configured for the KM Media Training Institute project.

## Current Setup

The project is deployed to GitHub Pages at: https://genius-space-foundation.github.io/kmmediatraininginstitute/

## Deployment Workflow

The deployment is handled by the GitHub Actions workflow located at `.github/workflows/deploy-pages.yml`. This workflow:

1. **Triggers on**: Push to `master` branch or manual workflow dispatch
2. **Builds the React app**: Runs `npm run build` in the `client` directory
3. **Deploys to GitHub Pages**: Uploads the built files to GitHub Pages

## Configuration

### Client Configuration

The React app is configured for GitHub Pages deployment with:

- **Homepage**: Set to `https://genius-space-foundation.github.io/kmmediatraininginstitute` in `client/package.json`
- **Build output**: Located in `client/build/` directory
- **Static assets**: Properly referenced with the correct base path

### GitHub Pages Settings

To enable GitHub Pages:

1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "GitHub Actions"
4. The workflow will automatically deploy when triggered

## Manual Deployment

If you need to manually trigger a deployment:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Deploy to GitHub Pages" workflow
3. Click "Run workflow" and select the branch (usually `master`)

## Troubleshooting

### Common Issues

1. **Build fails**: Check the GitHub Actions logs for build errors
2. **404 errors**: Ensure the `homepage` field in `client/package.json` is correct
3. **Assets not loading**: Verify that all static assets are properly referenced with the base path

### Checking Deployment Status

1. Check the "Actions" tab for workflow status
2. Visit the GitHub Pages URL to verify the deployment
3. Check the browser console for any JavaScript errors

## Local Testing

To test the build locally before deploying:

```bash
cd client
npm run build
npx serve -s build
```

This will serve the built files locally so you can verify everything works correctly.

## Important Notes

- The backend API is not deployed to GitHub Pages (it's a separate Node.js application)
- GitHub Pages only serves static files, so the React app will need to connect to a deployed backend API
- Make sure your API endpoints are configured to work with the production domain
