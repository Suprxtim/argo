const { spawn } = require('child_process');

// Set the memory limit
process.env.NODE_OPTIONS = '--max_old_space_size=4096';

// Run the build command
const build = spawn('npx', ['react-scripts', 'build'], {
  stdio: 'inherit',
  shell: true
});

build.on('close', (code) => {
  process.exit(code);
});