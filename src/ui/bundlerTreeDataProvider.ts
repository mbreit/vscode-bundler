import * as vscode from 'vscode';
import { BundlerDefinition, BundlerDependency, BundlerSpec } from '../bundler/bundlerLoader';
import { BundlerProvider } from '../bundler/bundlerProvider';
import { DependencyTreeElement } from './bundlerTree/dependencyTreeElement';
import { DefinitionTreeElement } from './bundlerTree/definitionTreeElement';

import path = require('path');

export type BundlerTreeElement = DefinitionTreeElement | DependencyTreeElement;

export class BundlerTreeDataProvider implements vscode.TreeDataProvider<BundlerTreeElement> {
  constructor(private bundlerProvider: BundlerProvider) {
    bundlerProvider.onUpdate(() => {
      this.onDidChangeTreeDataEmitter.fire(undefined);
    });
  }

  private onDidChangeTreeDataEmitter = new vscode.EventEmitter<BundlerTreeElement | undefined>();

  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  getTreeItem(treeElement: BundlerTreeElement): vscode.TreeItem {
    if (treeElement instanceof DefinitionTreeElement) {
      return this.gemfileTreeItem(treeElement.definition);
    }

    const spec = this.getSpec(treeElement);
    if (spec) {
      return this.resolvedGemTreeItem(spec);
    }

    return this.unresolvedGemTreeItem(treeElement.dependency);
  }

  getChildren(treeElement?: BundlerTreeElement): vscode.ProviderResult<BundlerTreeElement[]> {
    if (treeElement === undefined) {
      const definitions = this.bundlerProvider.getDefinitions().values();
      return [...definitions].map((definition) => new DefinitionTreeElement(definition));
    }

    if (treeElement instanceof DependencyTreeElement) {
      const spec = this.getSpec(treeElement);

      if (spec && spec.dependencies) {
        return this.dependenciesToTreeElements(treeElement.definition, spec.dependencies);
      }
      return [];
    }

    if (treeElement.definition.dependencies) {
      return this.dependenciesToTreeElements(
        treeElement.definition,
        treeElement.definition.dependencies,
      );
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
  ): Array<BundlerTreeElement> {
    return dependencies.map((dependency) => new DependencyTreeElement(definition, dependency));
  }

  private getSpec(treeElement: DependencyTreeElement): BundlerSpec | undefined {
    if (treeElement.definition.specs === undefined) {
      return undefined;
    }
    return treeElement.definition.specs.find((spec) => spec.name === treeElement.dependency.name);
  }
}