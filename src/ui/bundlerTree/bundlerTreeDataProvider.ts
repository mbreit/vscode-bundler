import * as vscode from 'vscode';
import { BundlerDefinition, BundlerDependency, BundlerSpec } from '../../bundler/bundlerLoader';
import { BundlerProvider } from '../../bundler/bundlerProvider';
import { DependencyTreeElement } from './dependencyTreeElement';
import { DefinitionTreeElement } from './definitionTreeElement';

import path = require('path');

const SOURCE_ICONS: { [key: string]: string } = {
  path: 'file-symlink-directory',
  git: 'source-control',
  rubygems: 'package',
  gemspec: 'ruby',
};
const DEFAULT_SOURCE_ICON = 'question';

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
      return this.definitionTreeItem(treeElement.definition);
    }

    const spec = treeElement.getSpec();
    if (spec) {
      return this.resolvedDependencyTreeItem(spec);
    }

    return this.unresolvedDependencyTreeItem(treeElement.dependency);
  }

  getChildren(treeElement?: BundlerTreeElement): vscode.ProviderResult<BundlerTreeElement[]> {
    if (treeElement === undefined) {
      return this.bundlerProvider.getGemfilesWithDefinitions().map(
        ([gemfile, definition]) => new DefinitionTreeElement(gemfile, definition),
      );
    }

    return treeElement.getDependencies().map(
      (dependency) => new DependencyTreeElement(
        treeElement.gemfile, treeElement.definition, dependency,
      ),
    );
  }

  private unresolvedDependencyTreeItem(dependency: BundlerDependency): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(dependency.name, vscode.TreeItemCollapsibleState.None);
    treeItem.description = dependency.requirement;
    treeItem.iconPath = new vscode.ThemeIcon(DEFAULT_SOURCE_ICON);
    treeItem.contextValue = 'dependency.unresolved';
    return treeItem;
  }

  private resolvedDependencyTreeItem(spec: BundlerSpec): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(spec.name, spec.dependencies.length !== 0
      ? vscode.TreeItemCollapsibleState.Collapsed
      : vscode.TreeItemCollapsibleState.None);
    treeItem.description = spec.version;
    treeItem.iconPath = this.specIcon(spec);
    treeItem.contextValue = 'dependency.resolved';
    treeItem.tooltip = spec.summary;
    return treeItem;
  }

  private specIcon(spec: BundlerSpec): vscode.ThemeIcon {
    return new vscode.ThemeIcon(SOURCE_ICONS[spec.source] ?? DEFAULT_SOURCE_ICON);
  }

  private definitionTreeItem(definition: BundlerDefinition): vscode.TreeItem {
    const gemfilePath = path.join(definition.path, 'Gemfile');
    const treeItem = new vscode.TreeItem(
      vscode.Uri.parse(gemfilePath),
      vscode.TreeItemCollapsibleState.Expanded,
    );
    treeItem.label = path.basename(definition.path);
    treeItem.tooltip = gemfilePath;
    treeItem.iconPath = vscode.ThemeIcon.File;
    treeItem.contextValue = 'definition.resolved';
    if (definition.errorMessage) {
      treeItem.label += ' ⚠';
      treeItem.tooltip += '\n\n';
      treeItem.tooltip += definition.errorMessage;
      treeItem.contextValue = 'definition.unresolved';
    }
    return treeItem;
  }
}
