import * as vscode from 'vscode';
import { BundlerProvider } from '../bundler/bundlerProvider';
import { chooseGemfile, chooseGemfileDir } from './chooseGemfile';
import { runBundlerInTerminal } from './terminalUtils';
import { DependencyTreeElement } from './bundlerTree/dependencyTreeElement';
import { DefinitionTreeElement } from './bundlerTree/definitionTreeElement';
import { BundlerSpec } from '../bundler/bundlerLoader';

function registerBundlerTerminalCommand(
  context: vscode.ExtensionContext,
  commandId: string,
  command: string,
): void {
  const disposable = vscode.commands.registerCommand(commandId, async (cwdArg) => {
    try {
      const cwd = cwdArg ?? await chooseGemfileDir();
      // cwd is undefined if the user has canceled the selection,
      // in which case we have nothing to do
      if (cwd !== undefined) runBundlerInTerminal(command, cwd);
    } catch (err) {
      vscode.window.showErrorMessage(err.message);
    }
  });
  context.subscriptions.push(disposable);
}

function registerReloadDependenciesCommand(
  context: vscode.ExtensionContext,
  bundlerProvider: BundlerProvider,
): void {
  const reloadCommand = vscode.commands.registerCommand(
    'bundler.reloadDependencies',
    () => bundlerProvider.reload(),
  );
  context.subscriptions.push(reloadCommand);
}

function registerOpenGemfileCommand(context: vscode.ExtensionContext): void {
  const command = vscode.commands.registerCommand(
    'bundler.openGemfile',
    async (element: DefinitionTreeElement) => {
      const uri = element.gemfile ?? await chooseGemfile();
      if (uri) vscode.commands.executeCommand('vscode.open', uri);
    },
  );
  context.subscriptions.push(command);
}

async function chooseGem(bundlerProvider: BundlerProvider): Promise<BundlerSpec | undefined> {
  const gemfile = await chooseGemfile();
  if (gemfile === undefined) return undefined;

  const definition = bundlerProvider.getDefinitions().get(gemfile.toString());

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

function registerOpenGemCommand(
  context: vscode.ExtensionContext,
  bundlerProvider: BundlerProvider,
): void {
  const command = vscode.commands.registerCommand(
    'bundler.openGem',
    async (element: DependencyTreeElement) => {
      const spec = element?.getSpec() ?? await chooseGem(bundlerProvider);
      if (spec) {
        vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.parse(spec.path), true);
      }
    },
  );
  context.subscriptions.push(command);
}

export function registerCommands(
  context: vscode.ExtensionContext,
  bundlerProvider: BundlerProvider,
): void {
  registerBundlerTerminalCommand(context, 'bundler.bundleInstall', 'install');
  registerBundlerTerminalCommand(context, 'bundler.bundleOutdated', 'outdated');
  registerReloadDependenciesCommand(context, bundlerProvider);
  registerOpenGemfileCommand(context);
  registerOpenGemCommand(context, bundlerProvider);
}
