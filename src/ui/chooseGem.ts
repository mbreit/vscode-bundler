import * as vscode from 'vscode';
import { BundlerProvider } from '../bundler/bundlerProvider';
import { chooseGemfile } from './chooseGemfile';
import { BundlerSpec } from '../bundler/bundlerLoader';

export async function chooseGem(
  bundlerProvider: BundlerProvider,
): Promise<BundlerSpec | undefined> {
  const gemfile = await chooseGemfile(bundlerProvider, true);
  if (gemfile === undefined) return undefined;

  const definition = bundlerProvider.getDefinition(gemfile);

  if (definition?.specs === undefined) throw new Error('Gems are not resolved');

  const quickPickResult = await vscode.window.showQuickPick(
    definition.specs.map((spec) => {
      const label = spec.name;
      const detail = spec.summary;
      const description = spec.version;
      return {
        label, detail, spec, description,
      };
    }),
  );
  return quickPickResult?.spec;
}
