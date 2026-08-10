import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const ENV_FILE = '.env';
const WORKFLOW = 'keep-awake.yml';

function fail(message) {
  console.error(`Keep-alive setup failed: ${message}`);
  process.exit(1);
}

function parseEnv(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
        return [key, value];
      })
  );
}

function runGh(args, { input, timeout = 30_000 } = {}) {
  const result = spawnSync('gh', args, { encoding: 'utf8', input, timeout });
  if (result.error) fail(`cannot run gh: ${result.error.message}`);
  if (result.status !== 0) fail(result.stderr.trim() || `gh ${args[0]} failed`);
  return result.stdout.trim();
}

function isPrivilegedKey(key) {
  if (key.startsWith('sb_secret_')) return true;
  const parts = key.split('.');
  if (parts.length !== 3) return false;
  try {
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString()).role === 'service_role';
  } catch {
    return false;
  }
}

async function findNewRun(repo, previousRunIds) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const output = runGh([
      'run', 'list', '--repo', repo, '--workflow', WORKFLOW, '--event', 'workflow_dispatch',
      '--limit', '5', '--json', 'databaseId',
    ]);
    const runs = JSON.parse(output || '[]');
    const run = runs.find((item) => !previousRunIds.has(item.databaseId));
    if (run) return run.databaseId;
    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }
  fail('GitHub did not create the manual workflow run');
}

let envSource;
try {
  envSource = await readFile(ENV_FILE, 'utf8');
} catch {
  fail(`${ENV_FILE} is missing`);
}

const env = parseEnv(envSource);
const supabaseUrl = env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const publicKey = env.VITE_SUPABASE_ANON_KEY;

if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl || '')) {
  fail('VITE_SUPABASE_URL is missing or invalid');
}
if (!publicKey) fail('VITE_SUPABASE_ANON_KEY is missing');
if (isPrivilegedKey(publicKey)) fail('refusing to use a secret/service_role key');

runGh(['auth', 'status']);

const endpoint = `${supabaseUrl}/rest/v1/entries?select=id&limit=1`;
const response = await fetch(endpoint, { headers: { apikey: publicKey } });
if (!response.ok) fail(`local database ping returned HTTP ${response.status}; run db:push first`);
console.log(`Local database ping succeeded: HTTP ${response.status}`);

const repo = runGh(['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner']);
runGh(['secret', 'set', 'SUPABASE_URL', '--repo', repo], { input: supabaseUrl });
runGh(['secret', 'set', 'SUPABASE_ANON_KEY', '--repo', repo], { input: publicKey });
console.log('GitHub Actions Secrets configured.');

const previousRuns = JSON.parse(
  runGh([
    'run', 'list', '--repo', repo, '--workflow', WORKFLOW, '--event', 'workflow_dispatch',
    '--limit', '5', '--json', 'databaseId',
  ]) || '[]'
);
const previousRunIds = new Set(previousRuns.map((run) => run.databaseId));

runGh(['workflow', 'run', WORKFLOW, '--repo', repo]);
const runId = await findNewRun(repo, previousRunIds);
runGh(['run', 'watch', String(runId), '--repo', repo, '--exit-status'], { timeout: 180_000 });

const result = JSON.parse(
  runGh(['run', 'view', String(runId), '--repo', repo, '--json', 'conclusion,url'])
);
if (result.conclusion !== 'success') fail(`remote workflow finished with ${result.conclusion}`);

const log = runGh(['run', 'view', String(runId), '--repo', repo, '--log']);
if (!log.includes('Supabase database ping succeeded: HTTP 200')) {
  fail('remote workflow was green but the HTTP 200 confirmation is missing');
}

console.log(`Keep-alive verified: ${result.url}`);
