import * as vscode from 'vscode';
import { BundlerDefinition, BundlerDependency } from '../../bundler/bundlerLoader';

export class DefinitionTreeElement {
  constructor(public gemfile: vscode.Uri, public definition: BundlerDefinition) { }

  getDependencies(): Array<BundlerDependency> {
    return this.definition.dependencies ?? [];
  }
}
