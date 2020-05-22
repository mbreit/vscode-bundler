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

function getBundlerPath(): string {
  const config = vscode.workspace.getConfiguration('bundler');
  return config.get('bundlerPath') as string;
}

export function runBundlerInTerminal(command: string, cwd: string): void {
  runInTerminal(`${getBundlerPath()} ${command}`, cwd);
}

/**
 * Ask the user for a directory with a Gemfile if necessary
 *
 * If there is only one Gemfile in the workspace, its directory will be returned
 * without asking the user.
 *
 * @returns Promise that resolves to the path name to the directory
 *  or `undefined` if the selection was canceled,
 *  or rejects if there is no Gemfile in the workspace
 */
async function askForGemfileDirectory(): Promise<string | undefined> {
  const gemfiles = await vscode.workspace.findFiles('**/Gemfile');

  if (gemfiles.length === 0) throw new Error('No Gemfile found in current workspace');

  if (gemfiles.length === 1) return path.dirname(gemfiles[0].fsPath);

  const quickPickResult = await vscode.window.showQuickPick<GemfileQuickPickItem>(
    gemfiles.map((uri) => {
      const label = path.basename(path.dirname(uri.fsPath));
      const detail = vscode.workspace.asRelativePath(uri);
      return { label, detail, uri };
    }),
  );

  // Return undefined if selection was cancelled
  if (quickPickResult === undefined) return undefined;

  return path.dirname(quickPickResult.uri.fsPath);
}

export function registerBundlerTerminalCommand(
  context: vscode.ExtensionContext,
  commandId: string,
  command: string,
): void {
  const disposable = vscode.commands.registerCommand(commandId, async (cwdArg) => {
    try {
      const cwd = cwdArg ?? await askForGemfileDirectory();
      // cwd is undefined if the user has canceled the selection,
      // in which case we have nothing to do
      if (cwd !== undefined) runBundlerInTerminal(command, cwd);
    } catch (err) {
      vscode.window.showErrorMessage(err.message);
    }
  });
  context.subscriptions.push(disposable);
}
