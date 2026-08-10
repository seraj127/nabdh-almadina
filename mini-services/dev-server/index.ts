import { spawn, ChildProcess } from 'child_process';
import { appendFileSync } from 'fs';

const LOG = '/home/z/my-project/dev.log';

function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  appendFileSync(LOG, line);
  console.log(line.trim());
}

let currentProcess: ChildProcess | null = null;

function startServer() {
  log('Starting Next.js dev server...');

  const child = spawn('npx', ['next', 'dev', '-p', '3000'], {
    cwd: '/home/z/my-project',
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  currentProcess = child;

  child.stdout?.on('data', (data: Buffer) => {
    process.stdout.write(data);
    appendFileSync(LOG, data.toString());
  });

  child.stderr?.on('data', (data: Buffer) => {
    process.stderr.write(data);
    appendFileSync(LOG, data.toString());
  });

  child.on('exit', (code, signal) => {
    log(`Server exited code=${code} signal=${signal}, restarting in 5s...`);
    currentProcess = null;
    setTimeout(startServer, 5000);
  });

  child.on('error', (err) => {
    log(`Server error: ${err.message}, restarting in 5s...`);
    currentProcess = null;
    setTimeout(startServer, 5000);
  });

  log(`Server PID: ${child.pid}`);
}

startServer();

// Heartbeat
setInterval(() => {
  log('Watchdog heartbeat');
}, 60000);

// Keep alive
process.on('SIGTERM', () => log('SIGTERM received, ignoring'));
process.on('SIGINT', () => log('SIGINT received, ignoring'));
