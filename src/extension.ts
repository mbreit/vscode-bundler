// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { BundlerProvider } from './bundler/bundlerProvider';
import { registerTerminalCommand } from './ui/terminalUtils';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  const config = vscode.workspace.getConfiguration('bundler');
  const bundlerPath = config.get('bundlerPath');
  const bundlerProvider = new BundlerProvider(context, (definitions) => {
    // TODO: Update treeview and check for errors
    definitions.forEach((def, uri) => console.log(uri, def));
  });

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

  bundlerProvider.init();
}

// this method is called when your extension is deactivated
export function deactivate(): void {}
