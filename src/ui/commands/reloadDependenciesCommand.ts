import { BundlerProvider } from '../../bundler/bundlerProvider';
import { Command } from './command';

export class ReloadDependenciesCommand implements Command {
  commandId = 'bundler.reloadDependencies';

  constructor(private bundlerProvider: BundlerProvider) { }

  async perform(): Promise<void> {
    this.bundlerProvider.reload();
  }
}
