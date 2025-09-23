const { spawn } = require('child_process');
const path = require('path');

// Set memory limit
process.env.NODE_OPTIONS = '--max_old_space_size=4096';

// Use npx to run react-scripts build, which avoids permission issues with direct binary execution
const build = spawn('npx', ['react-scripts', 'build'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: process.env,
  shell: true
});

build.on('close', (code) => {
  console.log(`Build process exited with code ${code}`);
  process.exit(code);
});

build.on('error', (error) => {
  console.error('Build process failed with error:', error);
  process.exit(1);
});