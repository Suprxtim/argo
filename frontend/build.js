#!/usr/bin/env node

// Custom build script to avoid permission issues with react-scripts binary
const { spawn } = require('child_process');
const path = require('path');

// Resolve the react-scripts build script directly
const reactScriptsPath = path.resolve(__dirname, 'node_modules', 'react-scripts', 'bin', 'react-scripts.js');

// Spawn the build process
const buildProcess = spawn('node', [reactScriptsPath, 'build'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Handle process events
buildProcess.on('close', (code) => {
  console.log(`Build process exited with code ${code}`);
  process.exit(code);
});

buildProcess.on('error', (err) => {
  console.error('Build process failed:', err);
  process.exit(1);
});