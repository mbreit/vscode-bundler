// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { BundlerProvider } from './bundler/bundlerProvider';
import { registerTerminalCommand } from './ui/terminalUtils';
import { createBundlerTreeview } from './ui/bundlerTree/bundlerTreeView';

import path = require('path');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  const config = vscode.workspace.getConfiguration('bundler');
  const bundlerPath = config.get('bundlerPath');
  const bundlerProvider = new BundlerProvider(context);

  registerTerminalCommand(
    context,
    'bundler.bundleInstall',
    `${bundlerPath} install`,
  );
  registerTerminalCommand(
    context,
    'bundler.bundleOutdated',
    `${bundlerPath} outdated`,
  );

  const reloadCommand = vscode.commands.registerCommand(
    'bundler.reloadDependencies',
    () => bundlerProvider.reload(),
  );
  context.subscriptions.push(reloadCommand);

  const treeView = createBundlerTreeview(bundlerProvider);
  context.subscriptions.push(treeView);

  bundlerProvider.onUpdate((gemfilePath, definition) => {
    if (definition?.error === 'gemNotFound') {
      vscode.window.showInformationMessage(
        definition?.errorMessage ?? 'Could not resolve all gems',
        'Run bundle install',
      ).then((item) => {
        if (item === 'Run bundle install') {
          vscode.commands.executeCommand('bundler.bundleInstall', path.dirname(gemfilePath.fsPath));
        }
      });
    }
  });

  bundlerProvider.init();
}

// this method is called when your extension is deactivated
export function deactivate(): void {}
