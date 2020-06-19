import * as vscode from 'vscode';
import { BundlerProvider } from '../../bundler/bundlerProvider';
import { DependencyTreeElement } from '../bundlerTree/dependencyTreeElement';
import { chooseGem } from '../chooseGem';
import { Command } from './command';

export class AddGemToWorkspaceCommand implements Command {
  readonly commandId = 'bundler.addGemToWorkspace';

  constructor(private bundlerProvider: BundlerProvider) { }

  async perform(element: DependencyTreeElement | { path: string } | undefined): Promise<void> {
    let path;
    if (element instanceof DependencyTreeElement) {
      path = element.getSpec()?.path;
    } else if (element) {
      path = element.path;
    } else {
      const spec = await chooseGem(
        this.bundlerProvider,
        'Choose a gem to add to the current workspace',
      );
      path = spec?.path;
    }
    if (path) {
      vscode.workspace.updateWorkspaceFolders(
        vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0,
        null,
        { uri: vscode.Uri.parse(path) },
      );
    }
  }
}
