import * as vscode from 'vscode';
import { BundlerProvider } from '../../bundler/bundlerProvider';
import { DependencyTreeElement } from '../bundlerTree/dependencyTreeElement';
import { chooseGem } from '../chooseGem';
import { chooseGemWebsite } from '../chooseGemWebsite';
import { Command } from './command';

export class OpenGemWebsiteCommand implements Command {
  readonly commandId = 'bundler.openGemWebsite';

  constructor(private bundlerProvider: BundlerProvider) { }

  async perform(element: DependencyTreeElement | undefined): Promise<void> {
    const spec = element?.getSpec() ?? await chooseGem(
      this.bundlerProvider,
      'Choose a gem to open a website',
    );
    if (spec) {
      const url = await chooseGemWebsite(spec);
      if (url) { vscode.env.openExternal(url); }
    }
  }
}
