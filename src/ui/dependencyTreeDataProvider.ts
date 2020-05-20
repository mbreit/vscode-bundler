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
      return this.gemfileTreeItem(definition);
    }

    const spec = this.getSpec(definition, dependency);
    if (spec) {
      return this.resolvedGemTreeItem(spec);
    }

    return this.unresolvedGemTreeItem(dependency);
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

  private unresolvedGemTreeItem(dependency: BundlerDependency): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(dependency.name, vscode.TreeItemCollapsibleState.None);
    treeItem.description = dependency.requirement;
    treeItem.iconPath = new vscode.ThemeIcon('question');
    return treeItem;
  }

  private resolvedGemTreeItem(spec: BundlerSpec): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(spec.name, spec.dependencies.length !== 0
      ? vscode.TreeItemCollapsibleState.Collapsed
      : vscode.TreeItemCollapsibleState.None);
    treeItem.description = spec.version;
    treeItem.iconPath = new vscode.ThemeIcon('package');
    return treeItem;
  }

  private gemfileTreeItem(definition: BundlerDefinition): vscode.TreeItem {
    const gemfilePath = path.join(definition.path, 'Gemfile');
    const treeItem = new vscode.TreeItem(
      vscode.Uri.parse(gemfilePath),
      vscode.TreeItemCollapsibleState.Expanded,
    );
    treeItem.label = path.basename(definition.path);
    treeItem.tooltip = gemfilePath;
    treeItem.iconPath = vscode.ThemeIcon.File;
    if (definition.errorMessage) {
      treeItem.label += ' ⚠';
      treeItem.tooltip += '\n\n';
      treeItem.tooltip += definition.errorMessage;
    }
    return treeItem;
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
