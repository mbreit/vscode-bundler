import * as vscode from 'vscode';
import { DependencyTreeElement } from './dependencyTreeElement';
import { BundlerDefinition, BundlerDependency, BundlerSpec } from '../bundler/bundlerLoader';
import { BundlerProvider } from '../bundler/bundlerProvider';

import path = require('path');

export class DependencyTreeDataProvider implements vscode.TreeDataProvider<DependencyTreeElement> {
  constructor(private bundlerProvider: BundlerProvider) {
    bundlerProvider.onUpdate(() => {
      this.onDidChangeTreeDataEmitter.fire(undefined);
    });
  }

  private onDidChangeTreeDataEmitter = new vscode.EventEmitter<DependencyTreeElement | undefined>();

  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  getTreeItem([definition, dependency]: DependencyTreeElement): vscode.TreeItem {
    if (dependency === undefined) {
      const treeItem = new vscode.TreeItem(
        'Gemfile',
        vscode.TreeItemCollapsibleState.Collapsed,
      );
      treeItem.description = this.getPathLabel(definition);
      return treeItem;
    }

    const spec = this.getSpec(definition, dependency);
    if (spec) {
      const treeItem = new vscode.TreeItem(
        spec.name,
        spec.dependencies.length !== 0
          ? vscode.TreeItemCollapsibleState.Collapsed
          : vscode.TreeItemCollapsibleState.None,
      );
      treeItem.description = spec.version;
      return treeItem;
    }

    const treeItem = new vscode.TreeItem(
      dependency.name,
      vscode.TreeItemCollapsibleState.None,
    );
    treeItem.description = dependency.requirement;
    return treeItem;
  }

  private getPathLabel(definition: BundlerDefinition): string | boolean | undefined {
    const definitionPath = definition.path;
    const folders = vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ?? [];
    if (folders.includes(definitionPath)) {
      return path.basename(definitionPath);
    }
    return vscode.workspace.asRelativePath(vscode.Uri.parse(definition.path));
  }

  getChildren(element?: DependencyTreeElement): vscode.ProviderResult<DependencyTreeElement[]> {
    if (element === undefined) {
      const definitions = this.bundlerProvider.getDefinitions().values();
      return [...definitions].map((definition) => [definition, undefined]);
    }
    const [definition, dependency] = element;

    if (dependency) {
      const spec = this.getSpec(definition, dependency);

      if (spec && spec.dependencies) {
        return this.dependenciesToTreeElements(definition, spec.dependencies);
      }
      return [];
    }

    if (definition.dependencies) {
      return this.dependenciesToTreeElements(definition, definition.dependencies);
    }

    return [];
  }

  private dependenciesToTreeElements(
    definition: BundlerDefinition,
    dependencies: Array<BundlerDependency>,
  ): Array<DependencyTreeElement> {
    return dependencies.map((dependency) => [definition, dependency]);
  }

  private getSpec(
    definition: BundlerDefinition, dependency: BundlerDependency,
  ): BundlerSpec | undefined {
    if (definition.specs === undefined) {
      return undefined;
    }
    return definition.specs.find((spec) => spec.name === dependency.name);
  }
}
