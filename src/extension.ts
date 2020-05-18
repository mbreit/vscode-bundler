// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { registerTerminalCommand, runInTerminal } from './ui/terminalUtils';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  const config = vscode.workspace.getConfiguration('bundler');
  const bundlerPath = config.get('bundlerPath');

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
  const disposable = vscode.commands.registerCommand('bundler.bundleOpen', async () => {
    const gemName = await vscode.window.showInputBox();
    runInTerminal(`${bundlerPath} open ${gemName}`);
  });
  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate(): void {}
