import * as vscode from 'vscode';
import { BundlerProvider } from '../../bundler/bundlerProvider';
import { chooseGemfile } from '../chooseGemfile';
import { DefinitionTreeElement } from '../bundlerTree/definitionTreeElement';
import { Command } from './command';

export class OpenGemfileCommand implements Command {
  commandId = 'bundler.openGemfile';

  constructor(private bundlerProvider: BundlerProvider) { }

  async perform(element: DefinitionTreeElement | undefined): Promise<void> {
    const uri = element?.gemfile ?? await chooseGemfile(this.bundlerProvider);
    if (uri) vscode.commands.executeCommand('vscode.open', uri);
  }
}
