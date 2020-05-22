import * as vscode from 'vscode';

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
