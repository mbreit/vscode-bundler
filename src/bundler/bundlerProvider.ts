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
    const watcher = vscode.workspace.createFileSystemWatcher('**/Gemfile}');
    // TODO: watch Gemfile.lock changes
    watcher.onDidChange((gemFile) => this.loadFile(gemFile));
    watcher.onDidCreate((gemFile) => this.loadFile(gemFile));
    watcher.onDidDelete((gemFile) => this.removeFile(gemFile));

    this.context.subscriptions.push(watcher);

    const gemFiles = await vscode.workspace.findFiles('Gemfile');
    gemFiles.forEach((gemFile) => this.loadFile(gemFile));
  }

  public getDefinitions(): Map<string, BundlerDefinition> {
    return this.bundlerDefinitions;
  }

  private async loadFile(gemFile: vscode.Uri): Promise<void> {
    const dir = gemFile.with({
      path: path.dirname(gemFile.path),
    });
    const definition = await this.bundlerLoader.loadDefinition(dir);
    this.bundlerDefinitions.set(gemFile.toString(), definition);
    this.notifyOnUpdate();
  }

  private removeFile(gemFile: vscode.Uri): void {
    this.bundlerDefinitions.delete(gemFile.toString());
    this.notifyOnUpdate();
  }

  private notifyOnUpdate(): void {
    this.onUpdateCallbacks.forEach((callback) => {
      callback.call(this, this.bundlerDefinitions);
    });
  }
}
