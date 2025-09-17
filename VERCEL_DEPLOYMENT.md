# Deploying FloatChat Frontend to Vercel

This guide explains how to deploy the FloatChat frontend to Vercel.

## Prerequisites

1. A Vercel account (https://vercel.com)
2. A GitHub/GitLab/Bitbucket account connected to Vercel
3. Your backend deployed and running (currently at https://argo-backend-dbvb.onrender.com)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`
5. Add environment variables:
   - `REACT_APP_API_URL`: `https://argo-backend-dbvb.onrender.com`
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to your project directory:
   ```bash
   cd frontend
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your project

### Option 3: Deploy via Git Integration

1. Push your latest changes to your Git repository
2. Connect your Git repository to Vercel
3. Vercel will automatically detect the React project and configure it
4. Make sure to set the root directory to `frontend` if deploying from a monorepo

## Configuration Details

### vercel.json
The `vercel.json` file in the frontend directory contains:
- Build configuration for Create React App
- Routing rules for client-side routing

### Environment Variables
Vercel will use the `REACT_APP_API_URL` environment variable from `.env.production` to connect to your backend. You can override this in the Vercel dashboard if needed.

## Custom Domain (Optional)

To use a custom domain:

1. In the Vercel dashboard, go to your project settings
2. Click on "Domains"
3. Add your custom domain
4. Follow Vercel's instructions for DNS configuration

## Troubleshooting

### Common Issues

1. **API Connection Issues**:
   - Ensure your backend CORS configuration includes your Vercel domain
   - Check that `REACT_APP_API_URL` is correctly set

2. **Build Failures**:
   - Make sure all dependencies are in package.json
   - Check that the build command is `npm run build`

3. **Routing Issues**:
   - The vercel.json file includes routing rules to handle client-side routing

### Checking Deployment Logs

1. In the Vercel dashboard, go to your project
2. Click on the deployment you want to inspect
3. View the build logs and function logs

## Best Practices

1. **Environment Variables**:
   - Always use `REACT_APP_` prefix for React environment variables
   - Set environment variables in Vercel dashboard rather than hardcoding

2. **Performance**:
   - Vercel automatically optimizes static assets
   - Use Vercel's built-in caching features

3. **Monitoring**:
   - Enable Vercel Analytics for performance monitoring
   - Set up error tracking with your preferred service

## Vercel vs Render Comparison

| Feature | Vercel | Render |
|---------|--------|--------|
| React Support | Excellent (native) | Good |
| Deployment Speed | Very Fast | Moderate |
| Global CDN | Yes | Limited |
| Custom Domains | Easy | Easy |
| Environment Variables | Intuitive UI | Simple UI |
| Analytics | Built-in | Limited |

Vercel is generally recommended for frontend deployments due to its superior React support and faster deployment times.