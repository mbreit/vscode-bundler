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
  metadata: { [key: string]: string };
  source: string;
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
  private outputChannel: vscode.OutputChannel;

  constructor(private context: vscode.ExtensionContext) {
    this.outputChannel = vscode.window.createOutputChannel('Bundler');
  }

  private executeRubyScript(script: string, cwd: string): Promise<string> {
    const scriptPath = this.context.asAbsolutePath(path.join('ruby', script));
    return new Promise((resolve, reject) => {
      childProcess.execFile(
        this.rubyExecutable(),
        [scriptPath],
        { cwd },
        (err, stdout, stderr) => {
          if (stderr.length > 0) {
            this.logStderr(scriptPath, cwd, stderr);
          }
          if (err) {
            this.logErr(scriptPath, cwd, err);
            reject(err);
          } else {
            resolve(stdout);
          }
        },
      );
    });
  }

  private logErr(scriptPath: string, cwd: string, err: childProcess.ExecException): void {
    this.outputChannel.appendLine(
      `Error running ruby process "${this.rubyExecutable()} ${scriptPath}" inside ${cwd}:`,
    );
    this.outputChannel.appendLine(err.message);
  }

  private logStderr(scriptPath: string, cwd: string, stderr: string): void {
    this.outputChannel.appendLine(
      `STDERR from ruby process "${this.rubyExecutable()} ${scriptPath}" inside ${cwd}:`,
    );
    this.outputChannel.appendLine(stderr);
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
