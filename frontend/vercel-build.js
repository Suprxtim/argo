#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Vercel build process...');

try {
  // Ensure react-scripts has proper permissions
  const reactScriptsPath = path.join(__dirname, 'node_modules', '.bin', 'react-scripts');
  
  if (fs.existsSync(reactScriptsPath)) {
    console.log('Setting executable permissions for react-scripts...');
    try {
      // On Unix-like systems, set executable permissions
      execSync(`chmod +x "${reactScriptsPath}"`, { stdio: 'inherit' });
    } catch (chmodError) {
      // On Windows, this might fail, which is okay
      console.log('Note: chmod not available or not needed on this platform');
    }
  } else {
    console.log('react-scripts not found in node_modules/.bin/');
  }

  // Run the build command with increased memory
  console.log('Running build with increased memory limit...');
  execSync('npx react-scripts build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--max_old_space_size=4096'
    }
  });

  console.log('Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}