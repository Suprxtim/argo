# Deployment Guide for Render

This guide explains how to deploy the FloatChat application on Render.

## Prerequisites

1. A Render account (https://render.com)
2. Your OpenRouter API key

## Deployment Steps

1. Fork this repository to your GitHub account
2. Log in to Render and create a new Web Service
3. Connect your GitHub repository
4. Configure the services with the settings provided in render.yaml

## Render Configuration

The `render.yaml` file in the root directory defines both services:

### Backend Service Configuration

- **Name**: floatchat-backend
- **Runtime**: Python 3
- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**: `uvicorn backend.app:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `DEEPSEEK_API_KEY`: Your OpenRouter API key (set as secret)
  - `DEEPSEEK_API_URL`: https://openrouter.ai/api/v1/chat/completions
  - `HOST`: 0.0.0.0
  - `PORT`: 8000
  - `CORS_ORIGINS`: ["https://floatchat.onrender.com"]
  - `LOG_LEVEL`: INFO

### Frontend Service Configuration

- **Name**: floatchat-frontend
- **Runtime**: Static Site
- **Build Command**: `npm install && npm run build`
- **Static Publish Path**: ./frontend/build
- **Environment Variables**:
  - `REACT_APP_API_URL`: https://floatchat-backend.onrender.com

## Post-Deployment Steps

1. After deploying the backend, update the CORS_ORIGINS environment variable with the actual frontend URL
2. Update the REACT_APP_API_URL in the frontend with the actual backend URL
3. Redeploy both services

## Troubleshooting

If you encounter issues:

1. Check that your OpenRouter API key is correctly set in the backend environment variables
2. Verify that the CORS configuration includes your frontend domain
3. Ensure that the frontend can reach the backend API endpoints
4. Check the logs for both services in the Render dashboard

## Custom Domain (Optional)

To use a custom domain:

1. In the Render dashboard, go to your services
2. Click on "Settings" for each service
3. Under "Custom Domains", add your domain
4. Follow Render's instructions for DNS configuration