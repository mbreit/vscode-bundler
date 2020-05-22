import * as vscode from 'vscode';
import { BundlerProvider } from '../bundler/bundlerProvider';

import path = require('path');

export interface GemfileQuickPickItem extends vscode.QuickPickItem {
  uri: vscode.Uri;
}

/**
 * Ask the user for a Gemfile if necessary
 *
 * If there is only one Gemfile in the workspace, it will be returned
 * without asking the user.
 *
 * @returns Promise that resolves to the uri of the Gemfile
 *  or `undefined` if the selection was canceled,
 *  or rejects if there is no Gemfile in the workspace
 */
export async function chooseGemfile(
  bundlerProvider: BundlerProvider, onlyResolved = false,
): Promise<vscode.Uri | undefined> {
  let gemfiles = bundlerProvider.getGemfiles();
  if (onlyResolved) {
    gemfiles = gemfiles.filter((gemfile) => !!bundlerProvider.getDefinition(gemfile)?.specs);
  }

  if (gemfiles.length === 0) {
    throw new Error(onlyResolved
      ? 'No resolved Gemfile found in current workspace'
      : 'No Gemfile found in current workspace');
  }

  if (gemfiles.length === 1) return gemfiles[0];

  const quickPickResult = await vscode.window.showQuickPick<GemfileQuickPickItem>(
    gemfiles.map((uri) => {
      const label = path.basename(path.dirname(uri.fsPath));
      const detail = vscode.workspace.asRelativePath(uri);
      return { label, detail, uri };
    }),
  );
  return quickPickResult?.uri;
}

/**
 * Ask the user for a directory with a Gemfile if necessary
 *
 * If there is only one Gemfile in the workspace, its directory will be returned
 * without asking the user.
 *
 * @returns Promise that resolves to the path name to the directory
 *  or `undefined` if the selection was canceled,
 *  or rejects if there is no Gemfile in the workspace
 */
export async function chooseGemfileDir(
  bundlerProvider: BundlerProvider,
): Promise<string | undefined> {
  const uri = await chooseGemfile(bundlerProvider);
  if (uri === undefined) return undefined;

  return path.dirname(uri.fsPath);
}
