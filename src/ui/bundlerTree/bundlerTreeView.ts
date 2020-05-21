import * as vscode from 'vscode';
import { BundlerTreeDataProvider, BundlerTreeElement } from './bundlerTreeDataProvider';
import { BundlerProvider } from '../../bundler/bundlerProvider';

export function createBundlerTreeview(
  bundlerProvider: BundlerProvider,
): vscode.TreeView<BundlerTreeElement> {
  const treeView = vscode.window.createTreeView<BundlerTreeElement>(
    'bundler.bundlerDependencies',
    {
      treeDataProvider: new BundlerTreeDataProvider(bundlerProvider),
    },
  );

  return treeView;
}
