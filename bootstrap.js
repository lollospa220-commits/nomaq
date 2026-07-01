const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectDir = '/Users/lorenzospavone/.gemini/antigravity/scratch/nomaq';
const nodeExec = process.execPath;

// Download and install npm using Node's built-in module installer
// We'll use the node:child_process to bootstrap npm
async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const follow = (url) => {
      https.get(url, { headers: { 'User-Agent': 'node' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return follow(res.headers.location);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }).on('error', reject);
    };
    follow(url);
  });
}

async function main() {
  console.log('Using Node:', nodeExec, process.version);

  // Download npm tarball
  const npmUrl = 'https://registry.npmjs.org/npm/-/npm-10.9.2.tgz';
  const tarPath = path.join(projectDir, '.npm-download.tgz');
  const npmDir = path.join(projectDir, '.npm-local');

  if (!fs.existsSync(path.join(npmDir, 'bin', 'npm-cli.js'))) {
    console.log('Downloading npm...');
    await downloadFile(npmUrl, tarPath);
    console.log('Downloaded. Extracting...');

    // Extract using node's zlib + tar-stream logic
    // Since we don't have tar module, use the system tar
    fs.mkdirSync(npmDir, { recursive: true });
    execSync(`tar xzf "${tarPath}" -C "${npmDir}" --strip-components=1`, { stdio: 'inherit' });
    fs.unlinkSync(tarPath);
    console.log('npm extracted to', npmDir);
  } else {
    console.log('npm already installed at', npmDir);
  }

  // Now run npm install
  const npmCli = path.join(npmDir, 'bin', 'npm-cli.js');
  console.log('\\nRunning npm install...');
  execSync(`"${nodeExec}" "${npmCli}" install`, {
    cwd: projectDir,
    stdio: 'inherit',
    env: { ...process.env, PATH: path.dirname(nodeExec) + ':' + (process.env.PATH || '') }
  });
  console.log('\\n✅ npm install completed!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
