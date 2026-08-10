import { spawn } from "child_process";

const log = (msg: string) =>
  console.log(`[${new Date().toISOString()}] [WATCHDOG] ${msg}`);

let attempt = 0;

function start() {
  attempt++;
  log(`Attempt #${attempt}: Starting Next.js dev server...`);
  const proc = spawn("npx", ["next", "dev", "-p", "3000"], {
    cwd: "/home/z/my-project",
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env },
  });
  proc.stdout.on("data", (d: Buffer) => process.stdout.write(d));
  proc.stderr.on("data", (d: Buffer) => process.stderr.write(d));
  proc.on("exit", (code, sig) => {
    log(`Exited code=${code} sig=${sig}. Restarting in 5s...`);
    setTimeout(start, 5000);
  });
  proc.on("error", (err) => {
    log(`Error: ${err.message}. Restarting in 5s...`);
    setTimeout(start, 5000);
  });
  log(`PID: ${proc.pid}`);
}

start();
setInterval(() => log("heartbeat"), 60000);
