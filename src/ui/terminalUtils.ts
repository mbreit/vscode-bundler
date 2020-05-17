import * as vscode from 'vscode';

// Shared terminal for bundler commands
let terminal: vscode.Terminal | undefined;

function runInTerminal(command: string): void {
  terminal = terminal ?? vscode.window.createTerminal('bundler');
  terminal.sendText(command);
  terminal.show();
}

export function registerTerminalCommand(
  context: vscode.ExtensionContext,
  commandId: string,
  command: string,
): void {
  const disposable = vscode.commands.registerCommand(commandId, () => {
    runInTerminal(command);
  });
  context.subscriptions.push(disposable);
}
