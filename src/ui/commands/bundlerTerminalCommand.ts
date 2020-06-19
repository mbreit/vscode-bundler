import * as vscode from 'vscode';
import { BundlerProvider } from '../../bundler/bundlerProvider';
import { chooseGemfileDir } from '../chooseGemfile';
import { runBundlerInTerminal } from '../terminalUtils';
import { Command } from './command';

export class BundlerTerminalCommand implements Command {
  constructor(
    public commandId: string,
    private bundlerProvider: BundlerProvider,
    private command: string,
  ) { }

  async perform(cwdArg: string | undefined): Promise<void> {
    try {
      const cwd = cwdArg ?? await chooseGemfileDir(this.bundlerProvider);
      // cwd is undefined if the user has canceled the selection,
      // in which case we have nothing to do
      if (cwd !== undefined) runBundlerInTerminal(this.command, cwd);
    } catch (err) {
      vscode.window.showErrorMessage(err.message);
    }
  }
}
