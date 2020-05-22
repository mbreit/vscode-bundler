// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { BundlerProvider } from './bundler/bundlerProvider';
import { registerBundlerTerminalCommand } from './ui/terminalUtils';
import { createBundlerTreeview } from './ui/bundlerTree/bundlerTreeView';

import { registerDefinitionErrorNotifications } from './ui/definitionErrorNotifications';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  const bundlerProvider = new BundlerProvider(context);

  registerBundlerTerminalCommand(
    context,
    'bundler.bundleInstall',
    'install',
  );
  registerBundlerTerminalCommand(
    context,
    'bundler.bundleOutdated',
    'outdated',
  );

  const reloadCommand = vscode.commands.registerCommand(
    'bundler.reloadDependencies',
    () => bundlerProvider.reload(),
  );
  context.subscriptions.push(reloadCommand);

  const treeView = createBundlerTreeview(bundlerProvider);
  context.subscriptions.push(treeView);

  registerDefinitionErrorNotifications(bundlerProvider);

  bundlerProvider.init();
}

// this method is called when your extension is deactivated
export function deactivate(): void {}
