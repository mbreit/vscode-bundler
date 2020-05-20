import * as childProcess from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';

export interface BundlerSpec {
  name: string;
  summary: string;
  version: string;
  homepage: string;
  path: string;
  dependencies: Array<BundlerDependency>;
}

export interface BundlerDependency {
  name: string;
  requirement: string;
}

export interface BundlerDefinition {
  status: 'ok' | 'error';
  path: string;
  specs?: Array<BundlerSpec>;
  dependencies?: Array<BundlerDependency>;
  error?: 'gemNotFound' | 'scriptError';
  errorMessage?: string;
}

export class BundlerLoader {
  constructor(private context: vscode.ExtensionContext) { }

  private executeRubyScript(script: string, cwd: string): Promise<string> {
    const scriptPath = this.context.asAbsolutePath(path.join('ruby', script));
    return new Promise((resolve, reject) => {
      childProcess.execFile(
        this.rubyExecutable(),
        [scriptPath],
        { cwd },
        (err, stdout, _stderr) => {
          // TODO: display stderr somewhere
          if (err) {
            reject(err);
          } else {
            resolve(stdout);
          }
        },
      );
    });
  }

  private rubyExecutable(): string {
    return vscode.workspace.getConfiguration('bundler').get('rubyPath') || 'ruby';
  }

  async loadDefinition(uri: vscode.Uri): Promise<BundlerDefinition> {
    try {
      const output = await this.executeRubyScript('bundler_dependencies_to_json.rb', uri.fsPath);
      const parsedOutput = JSON.parse(output) as BundlerDefinition;
      return parsedOutput;
    } catch (err) {
      return {
        status: 'error',
        path: uri.fsPath,
        error: 'scriptError',
        errorMessage: err.message,
      };
    }
  }
}
