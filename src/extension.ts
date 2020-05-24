// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { BundlerProvider } from './bundler/bundlerProvider';
import { createBundlerTreeview } from './ui/bundlerTree/bundlerTreeView';
import { registerDefinitionErrorNotifications } from './ui/definitionErrorNotifications';
import { registerCommands } from './ui/commands';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  const bundlerProvider = new BundlerProvider(context);

  bundlerProvider.onUpdate(() => {
    vscode.commands.executeCommand(
      'setContext',
      'bundler:hasGemfile',
      bundlerProvider.hasGemfile(),
    );
  });

  registerCommands(context, bundlerProvider);
  registerDefinitionErrorNotifications(bundlerProvider);
  createBundlerTreeview(context, bundlerProvider);

  bundlerProvider.init();
}

// this method is called when your extension is deactivated
export function deactivate(): void {}
