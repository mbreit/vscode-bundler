import * as vscode from 'vscode';
import { BundlerProvider } from '../bundler/bundlerProvider';
import { chooseGemfile, chooseGemfileDir } from './chooseGemfile';
import { runBundlerInTerminal } from './terminalUtils';
import { DependencyTreeElement } from './bundlerTree/dependencyTreeElement';

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
  const openGemfileCommand = vscode.commands.registerCommand(
    'bundler.openGemfile',
    async (element: DependencyTreeElement) => {
      const uri = element.gemfile ?? await chooseGemfile();
      if (uri) vscode.commands.executeCommand('vscode.open', uri);
    },
  );
  context.subscriptions.push(openGemfileCommand);
}

export function registerCommands(
  context: vscode.ExtensionContext,
  bundlerProvider: BundlerProvider,
): void {
  registerBundlerTerminalCommand(context, 'bundler.bundleInstall', 'install');
  registerBundlerTerminalCommand(context, 'bundler.bundleOutdated', 'outdated');
  registerReloadDependenciesCommand(context, bundlerProvider);
  registerOpenGemfileCommand(context);
}
