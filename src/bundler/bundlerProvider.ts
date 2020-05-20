import * as path from 'path';
import * as vscode from 'vscode';
import { BundlerDefinition, BundlerLoader } from './bundlerLoader';

type UpdateCallback = (definitions: Map<string, BundlerDefinition>) => void;

export class BundlerProvider {
  private bundlerLoader: BundlerLoader;

  private bundlerDefinitions: Map<string, BundlerDefinition>;

  private onUpdateCallbacks: Array<UpdateCallback>;

  constructor(
    private context: vscode.ExtensionContext,
  ) {
    this.bundlerLoader = new BundlerLoader(this.context);
    this.bundlerDefinitions = new Map();
    this.onUpdateCallbacks = [];
  }

  public onUpdate(updateCallback: UpdateCallback): void {
    this.onUpdateCallbacks.push(updateCallback);
  }

  public async init(): Promise<void> {
    this.setupFileSystemWatcher();
    await this.loadAllGemfiles();
  }

  private async loadAllGemfiles(): Promise<void> {
    const gemfiles = await vscode.workspace.findFiles('**/Gemfile');
    gemfiles.forEach((gemfile) => this.loadFile(gemfile));
  }

  private setupFileSystemWatcher(): void {
    const watcher = vscode.workspace.createFileSystemWatcher('**/{Gemfile,Gemfile.lock}');
    this.context.subscriptions.push(watcher);

    watcher.onDidChange((gemfileOrLockfile) => this.loadFile(gemfileOrLockfile));
    watcher.onDidCreate((gemfileOrLockfile) => this.loadFile(gemfileOrLockfile));
    watcher.onDidDelete((gemfileOrLockfile) => this.removeFile(gemfileOrLockfile));
  }

  public reload(): void {
    this.bundlerDefinitions = new Map();
    this.loadAllGemfiles();
  }

  public getDefinitions(): Map<string, BundlerDefinition> {
    return this.bundlerDefinitions;
  }

  private async findGemfile(gemfileOrLockfile: vscode.Uri): Promise<vscode.Uri | undefined> {
    const gemfilePath = this.gemfilePath(gemfileOrLockfile);
    try {
      await vscode.workspace.fs.stat(gemfilePath);
      return gemfilePath;
    } catch {
      return undefined;
    }
  }

  private gemfilePath(gemfileOrLockfile: vscode.Uri): vscode.Uri {
    return gemfileOrLockfile.with({
      path: path.join(path.dirname(gemfileOrLockfile.path), 'Gemfile'),
    });
  }

  private async loadFile(gemfileOrLockfile: vscode.Uri): Promise<void> {
    const gemfile = await this.findGemfile(gemfileOrLockfile);
    if (gemfile === undefined) {
      return;
    }

    const dir = gemfile.with({
      path: path.dirname(gemfile.path),
    });
    const definition = await this.bundlerLoader.loadDefinition(dir);
    this.bundlerDefinitions.set(gemfile.toString(), definition);
    this.notifyOnUpdate();
  }

  private async removeFile(gemfileOrLockfile: vscode.Uri): Promise<void> {
    const gemfile = this.gemfilePath(gemfileOrLockfile);

    this.bundlerDefinitions.delete(gemfile.toString());
    this.notifyOnUpdate();
  }

  private notifyOnUpdate(): void {
    this.onUpdateCallbacks.forEach((callback) => {
      callback.call(this, this.bundlerDefinitions);
    });
  }
}
