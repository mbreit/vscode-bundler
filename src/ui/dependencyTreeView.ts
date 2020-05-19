import * as vscode from 'vscode';
import { DependencyTreeElement } from './dependencyTreeElement';
import { DependencyTreeDataProvider } from './dependencyTreeDataProvider';
import { BundlerProvider } from '../bundler/bundlerProvider';

export function createDependencyTreeview(
  bundlerProvider: BundlerProvider,
): vscode.TreeView<DependencyTreeElement> {
  const treeView = vscode.window.createTreeView<DependencyTreeElement>(
    'bundler.bundlerDependencies',
    {
      treeDataProvider: new DependencyTreeDataProvider(bundlerProvider),
    },
  );

  return treeView;
}
