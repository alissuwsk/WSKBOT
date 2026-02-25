const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let restartCount = 0;
const maxRestarts = 5;
let botProcess = null;

function startBot() {
  botProcess = spawn('node', ['index.js'], {
    stdio: 'inherit',
    cwd: __dirname
  });

  botProcess.on('exit', (code, signal) => {
    const restartPath = path.join(__dirname, 'database', 'saves', 'restart.json');
    const isRestart = fs.existsSync(restartPath);

    if (code === 0 && !isRestart) {
      process.exit(0);
    } else if (code === 0 && isRestart) {
      setTimeout(startBot, 1000);
    } else {
      restartCount++;
      if (restartCount >= maxRestarts) {
        process.exit(1);
      }
      setTimeout(startBot, 3000);
    }
  });

  botProcess.on('error', (error) => {
    restartCount++;
    if (restartCount >= maxRestarts) {
      process.exit(1);
    }
    setTimeout(startBot, 3000);
  });

  process.on('SIGINT', () => {
    if (botProcess) botProcess.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    if (botProcess) botProcess.kill('SIGTERM');
  });
}

startBot();
