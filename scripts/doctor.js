const { runAllChecks } = require('../src/backend/doctor');

console.log('Running system health checks...\n');

const results = runAllChecks();

results.forEach(check => {
  let statusIcon = '❓';
  if (check.status === 'ok') statusIcon = '✅';
  if (check.status === 'warn') statusIcon = '⚠️ ';
  if (check.status === 'error') statusIcon = '❌';

  console.log(`${statusIcon} ${check.name}: ${check.message}`);
});

console.log('\nChecks complete.');

const hasError = results.some(r => r.status === 'error');
process.exit(hasError ? 1 : 0);
