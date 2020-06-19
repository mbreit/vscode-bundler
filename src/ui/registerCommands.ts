import * as vscode from 'vscode';
import { BundlerProvider } from '../bundler/bundlerProvider';
import { DependencyTreeElement } from './bundlerTree/dependencyTreeElement';
import { OpenGemWebsiteCommand } from './commands/openGemWebsiteCommand';
import { Command } from './commands/command';
import { AddGemToWorkspaceCommand } from './commands/addGemToWorkspaceCommand';
import { BundlerTerminalCommand } from './commands/bundlerTerminalCommand';
import { OpenGemfileCommand } from './commands/openGemfileCommand';
import { ReloadDependenciesCommand } from './commands/reloadDependenciesCommand';
import { OpenGemCommand } from './commands/openGemCommand';

function registerCommand(context: vscode.ExtensionContext, command: Command): void {
  const disposable = vscode.commands.registerCommand(
    command.commandId,
    async (element: DependencyTreeElement | undefined) => {
      command.perform(element);
    },
  );
  context.subscriptions.push(disposable);
}

export function registerCommands(
  context: vscode.ExtensionContext,
  bundlerProvider: BundlerProvider,
): void {
  [
    new BundlerTerminalCommand('bundler.bundleInstall', bundlerProvider, 'install'),
    new BundlerTerminalCommand('bundler.bundleOutdated', bundlerProvider, 'outdated'),
    new ReloadDependenciesCommand(bundlerProvider),
    new OpenGemfileCommand(bundlerProvider),
    new OpenGemCommand(bundlerProvider),
    new AddGemToWorkspaceCommand(bundlerProvider),
    new OpenGemWebsiteCommand(bundlerProvider),
  ].forEach((command) => registerCommand(context, command));
}
