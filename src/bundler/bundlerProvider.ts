import * as path from 'path';
import * as vscode from 'vscode';
import { BundlerDefinition, BundlerLoader } from './bundlerLoader';


export class BundlerProvider {
  private bundlerLoader: BundlerLoader;

  private bundlerDefinitions: Map<string, BundlerDefinition>;

  constructor(
    private context: vscode.ExtensionContext,
    private onUpdate: (definitions: Map<string, BundlerDefinition>) => void,
  ) {
    this.bundlerLoader = new BundlerLoader(this.context);
    this.bundlerDefinitions = new Map();
  }

  public async init(): Promise<void> {
    const watcher = vscode.workspace.createFileSystemWatcher('**/Gemfile}');
    watcher.onDidChange((gemFile) => this.loadFile(gemFile));
    watcher.onDidCreate((gemFile) => this.loadFile(gemFile));
    watcher.onDidDelete((gemFile) => this.removeFile(gemFile));

    this.context.subscriptions.push(watcher);

    const gemFiles = await vscode.workspace.findFiles('Gemfile');
    gemFiles.forEach((gemFile) => this.loadFile(gemFile));
  }

  private async loadFile(gemFile: vscode.Uri): Promise<void> {
    const dir = gemFile.with({
      path: path.dirname(gemFile.path),
    });
    const definition = await this.bundlerLoader.loadDefinition(dir);
    this.bundlerDefinitions.set(gemFile.toString(), definition);
    this.onUpdate(this.bundlerDefinitions);
  }

  private removeFile(gemFile: vscode.Uri): void {
    this.bundlerDefinitions.delete(gemFile.toString());
    this.onUpdate(this.bundlerDefinitions);
  }
}
