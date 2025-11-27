const { exec } = require('child_process');
const child = exec('npx cap sync', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
  console.error(stderr);
});

child.stdout.on('data', function(data) {
    console.log(data.toString());
});

child.stderr.on('data', function(data) {
    console.log(data.toString());
});