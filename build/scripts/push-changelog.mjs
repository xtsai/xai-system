import { execSync } from 'child_process';

async function main() {
  const { default: pkg } = await import('../../package.json', {
    assert: {
      type: 'json',
    },
  });

  const commandAdd = `git add .`;
  const commandCommit = `git commit -am "chore(): release v${pkg.version}"`;
  try {
    await execSync(commandAdd, { stdio: 'inherit' });
    await execSync(commandCommit, { stdio: 'inherit' });
  } catch (ex) {
    globalThis.console.error(ex);
  }
}

main();
