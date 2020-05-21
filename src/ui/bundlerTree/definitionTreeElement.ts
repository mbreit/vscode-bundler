import { BundlerDefinition, BundlerDependency } from '../../bundler/bundlerLoader';

export class DefinitionTreeElement {
  constructor(public definition: BundlerDefinition) { }

  getDependencies(): Array<BundlerDependency> {
    return this.definition.dependencies ?? [];
  }
}
