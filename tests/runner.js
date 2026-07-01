/**
 * Test Runner CLI script for Nomaq E2E tests
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

async function checkAppReachable() {
  try {
    const res = await fetch('http://localhost:3000', { signal: AbortSignal.timeout(1000) });
    return res.ok || res.status === 200;
  } catch (err) {
    return false;
  }
}

async function main() {
  let useMock = process.env.TEST_MOCK === 'true';

  if (!useMock) {
    console.log('Checking if http://localhost:3000 is reachable...');
    const reachable = await checkAppReachable();
    if (!reachable) {
      console.error('Error: http://localhost:3000 is unreachable but TEST_MOCK is not set to true.');
      console.error('Failing immediately to prevent mock fallback in E2E mode.');
      process.exit(1);
    } else {
      console.log('http://localhost:3000 is reachable. Running tests in E2E mode.');
    }
  } else {
    console.log('TEST_MOCK is set to true. Running in mock mode.');
  }

  const env = { ...process.env, TEST_MOCK: useMock ? 'true' : 'false' };

  const testFiles = [
    path.join(__dirname, 'tier1_feature_coverage.test.js'),
    path.join(__dirname, 'tier2_boundary_cases.test.js')
  ];

  console.log(`Running test suites with node:test...\n`);

  // Run tests using Node's built-in '--test' command.
  const child = spawn(process.execPath, ['--test', ...testFiles], {
    stdio: 'inherit',
    env
  });

  child.on('close', (code) => {
    process.exit(code || 0);
  });
}

main().catch(err => {
  console.error('Runner failed:', err);
  process.exit(1);
});
