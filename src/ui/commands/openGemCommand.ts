import * as vscode from 'vscode';
import { BundlerProvider } from '../../bundler/bundlerProvider';
import { DependencyTreeElement } from '../bundlerTree/dependencyTreeElement';
import { chooseGem } from '../chooseGem';
import { Command } from './command';

export class OpenGemCommand implements Command {
  commandId = 'bundler.openGem';

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
        'Choose a gem to open in a new window',
      );
      path = spec?.path;
    }
    if (path) {
      vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.parse(path), true);
    }
  }
}
