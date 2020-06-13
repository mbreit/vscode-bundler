import * as vscode from 'vscode';
import { BundlerProvider } from '../bundler/bundlerProvider';
import { chooseGemfile, chooseGemfileDir } from './chooseGemfile';
import { runBundlerInTerminal } from './terminalUtils';
import { DependencyTreeElement } from './bundlerTree/dependencyTreeElement';
import { DefinitionTreeElement } from './bundlerTree/definitionTreeElement';
import { chooseGem } from './chooseGem';
import { chooseGemWebsite } from './chooseGemWebsite';

function registerBundlerTerminalCommand(
  context: vscode.ExtensionContext,
  bundlerProvider: BundlerProvider,
  commandId: string,
  command: string,
): void {
  const disposable = vscode.commands.registerCommand(
    commandId,
    async (cwdArg: string | undefined) => {
      try {
        const cwd = cwdArg ?? await chooseGemfileDir(bundlerProvider);
        // cwd is undefined if the user has canceled the selection,
        // in which case we have nothing to do
        if (cwd !== undefined) runBundlerInTerminal(command, cwd);
      } catch (err) {
        vscode.window.showErrorMessage(err.message);
      }
    },
  );
  context.subscriptions.push(disposable);
}

function registerReloadDependenciesCommand(
  context: vscode.ExtensionContext,
  bundlerProvider: BundlerProvider,
): void {
  const reloadCommand = vscode.commands.registerCommand(
    'bundler.reloadDependencies',
    () => bundlerProvider.reload(),
  );
  context.subscriptions.push(reloadCommand);
}

function registerOpenGemfileCommand(
  context: vscode.ExtensionContext,
  bundlerProvider: BundlerProvider,
): void {
  const command = vscode.commands.registerCommand(
    'bundler.openGemfile',
    async (element: DefinitionTreeElement | undefined) => {
      const uri = element?.gemfile ?? await chooseGemfile(bundlerProvider);
      if (uri) vscode.commands.executeCommand('vscode.open', uri);
    },
  );
  context.subscriptions.push(command);
}

function registerOpenGemCommand(
  context: vscode.ExtensionContext,
  bundlerProvider: BundlerProvider,
): void {
  const command = vscode.commands.registerCommand(
    'bundler.openGem',
    async (element: DependencyTreeElement | undefined) => {
      const spec = element?.getSpec() ?? await chooseGem(
        bundlerProvider,
        'Choose a gem to open in a new window',
      );
      if (spec) {
        vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.parse(spec.path), true);
      }
    },
  );
  context.subscriptions.push(command);
}

function registerAddGemToWorkspaceCommand(
  context: vscode.ExtensionContext,
  bundlerProvider: BundlerProvider,
): void {
  const command = vscode.commands.registerCommand(
    'bundler.addGemToWorkspace',
    async (element: DependencyTreeElement | undefined) => {
      const spec = element?.getSpec() ?? await chooseGem(
        bundlerProvider,
        'Choose a gem to add to the current workspace',
      );
      if (spec) {
        vscode.workspace.updateWorkspaceFolders(
          vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0,
          null,
          { uri: vscode.Uri.parse(spec.path) },
        );
      }
    },
  );
  context.subscriptions.push(command);
}

function registerOpenGemWebsiteCommand(
  context: vscode.ExtensionContext,
  bundlerProvider: BundlerProvider,
): void {
  const command = vscode.commands.registerCommand(
    'bundler.openGemWebsite',
    async (element: DependencyTreeElement | undefined) => {
      const spec = element?.getSpec() ?? await chooseGem(
        bundlerProvider,
        'Choose a gem to open a website',
      );
      if (spec) {
        const url = await chooseGemWebsite(spec);
        if (url) { vscode.env.openExternal(url); }
      }
    },
  );
  context.subscriptions.push(command);
}

export function registerCommands(
  context: vscode.ExtensionContext,
  bundlerProvider: BundlerProvider,
): void {
  registerBundlerTerminalCommand(context, bundlerProvider, 'bundler.bundleInstall', 'install');
  registerBundlerTerminalCommand(context, bundlerProvider, 'bundler.bundleOutdated', 'outdated');
  registerReloadDependenciesCommand(context, bundlerProvider);
  registerOpenGemfileCommand(context, bundlerProvider);
  registerOpenGemCommand(context, bundlerProvider);
  registerAddGemToWorkspaceCommand(context, bundlerProvider);
  registerOpenGemWebsiteCommand(context, bundlerProvider);
}
