import { spawn } from 'child_process';

function startServer() {
  console.log(`[${new Date().toISOString()}] Starting Next.js dev server...`);
  const child = spawn('npx', ['next', 'dev', '-p', '3000'], {
    cwd: '/home/z/my-project',
    stdio: 'inherit',
    detached: false,
  });
  
  child.on('exit', (code) => {
    console.log(`[${new Date().toISOString()}] Server exited with code ${code}, restarting in 3s...`);
    setTimeout(startServer, 3000);
  });
  
  child.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Server error: ${err.message}`);
    setTimeout(startServer, 3000);
  });
}

startServer();
