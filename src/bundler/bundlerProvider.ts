import * as path from 'path';
import * as vscode from 'vscode';
import { BundlerDefinition, BundlerLoader } from './bundlerLoader';

type UpdateCallback = (gemfile: vscode.Uri, definition: BundlerDefinition | undefined) => void;

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

  private async loadAllGemfiles(): Promise<void[]> {
    const gemfiles = await vscode.workspace.findFiles('**/Gemfile');
    return Promise.all(gemfiles.map((gemfile) => this.loadFile(gemfile)));
  }

  private setupFileSystemWatcher(): void {
    const watcher = vscode.workspace.createFileSystemWatcher('**/{Gemfile,Gemfile.lock}');
    this.context.subscriptions.push(watcher);

    watcher.onDidChange((gemfileOrLockfile) => this.loadFile(gemfileOrLockfile));
    watcher.onDidCreate((gemfileOrLockfile) => this.loadFile(gemfileOrLockfile));
    watcher.onDidDelete((gemfileOrLockfile) => this.removeFile(gemfileOrLockfile));
  }

  public async reload(): Promise<void> {
    this.bundlerDefinitions.clear();
    await this.loadAllGemfiles();
  }

  public hasGemfile(): boolean {
    return this.bundlerDefinitions.size > 0;
  }

  public getGemfiles(): Array<vscode.Uri> {
    return [...this.bundlerDefinitions.keys()].map((gemfilePath) => vscode.Uri.parse(gemfilePath));
  }

  public getGemfilesWithDefinitions(): Array<[vscode.Uri, BundlerDefinition]> {
    return [...this.bundlerDefinitions.entries()].map(
      ([gemfilePath, definition]) => [vscode.Uri.parse(gemfilePath), definition],
    );
  }

  public getDefinition(gemfile: vscode.Uri): BundlerDefinition | undefined {
    return this.bundlerDefinitions.get(gemfile.toString());
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
    this.notifyOnUpdate(gemfile, definition);
  }

  private async removeFile(gemfileOrLockfile: vscode.Uri): Promise<void> {
    const gemfile = this.gemfilePath(gemfileOrLockfile);

    this.bundlerDefinitions.delete(gemfile.toString());
    this.notifyOnUpdate(gemfile, undefined);
  }

  private notifyOnUpdate(gemfile: vscode.Uri, definition: BundlerDefinition | undefined): void {
    this.onUpdateCallbacks.forEach((callback) => {
      callback.call(this, gemfile, definition);
    });
  }
}
