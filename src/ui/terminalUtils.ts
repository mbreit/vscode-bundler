import * as vscode from 'vscode';

import { chooseGemfileDir } from './chooseGemfile';

// Shared terminal for bundler commands
let terminal: vscode.Terminal | undefined;

function runInTerminal(command: string, cwd: string): void {
  terminal = terminal ?? vscode.window.createTerminal('bundler');
  terminal.sendText(`cd ${cwd}`);
  terminal.sendText(command);
  terminal.show();
}

function getBundlerPath(): string {
  const config = vscode.workspace.getConfiguration('bundler');
  return config.get('bundlerPath') as string;
}

export function runBundlerInTerminal(command: string, cwd: string): void {
  runInTerminal(`${getBundlerPath()} ${command}`, cwd);
}

export function registerBundlerTerminalCommand(
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
