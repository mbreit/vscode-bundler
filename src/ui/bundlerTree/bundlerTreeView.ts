import * as vscode from 'vscode';
import { BundlerTreeDataProvider, BundlerTreeElement } from './bundlerTreeDataProvider';
import { BundlerProvider } from '../../bundler/bundlerProvider';

export function createBundlerTreeview(
  context: vscode.ExtensionContext,
  bundlerProvider: BundlerProvider,
): void {
  const treeView = vscode.window.createTreeView<BundlerTreeElement>(
    'bundler.bundlerDependencies',
    {
      treeDataProvider: new BundlerTreeDataProvider(bundlerProvider),
    },
  );

  context.subscriptions.push(treeView);
}
