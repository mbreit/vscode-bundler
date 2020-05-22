import * as vscode from 'vscode';

import path = require('path');

interface GemfileQuickPickItem extends vscode.QuickPickItem {
  uri: vscode.Uri;
}

// Shared terminal for bundler commands
let terminal: vscode.Terminal | undefined;

function runInTerminal(command: string, cwd: string): void {
  terminal = terminal ?? vscode.window.createTerminal('bundler');
  terminal.sendText(`cd ${cwd}`);
  terminal.sendText(command);
  terminal.show();
}

async function askForGemfileDirectory(): Promise<string | undefined> {
  const gemfiles = await vscode.workspace.findFiles('**/Gemfile');

  if (gemfiles.length === 0) {
    vscode.window.showErrorMessage('No Gemfile found in current workspace');
    return undefined;
  }

  if (gemfiles.length === 1) return path.dirname(gemfiles[0].fsPath);

  const quickPickResult = await vscode.window.showQuickPick<GemfileQuickPickItem>(
    gemfiles.map((uri) => {
      const label = path.basename(path.dirname(uri.fsPath));
      const detail = vscode.workspace.asRelativePath(uri);
      return { label, detail, uri };
    }),
  );

  if (quickPickResult === undefined) return undefined;

  return path.dirname(quickPickResult.uri.fsPath);
}

export function registerTerminalCommand(
  context: vscode.ExtensionContext,
  commandId: string,
  command: string,
): void {
  const disposable = vscode.commands.registerCommand(commandId, async (cwdArg) => {
    const cwd = cwdArg ?? await askForGemfileDirectory();
    if (cwd !== undefined) runInTerminal(command, cwd);
  });
  context.subscriptions.push(disposable);
}
