import { BundlerDefinition, BundlerDependency, BundlerSpec } from '../../bundler/bundlerLoader';

export class DependencyTreeElement {
  constructor(public definition: BundlerDefinition, public dependency: BundlerDependency) { }

  getDependencies(): Array<BundlerDependency> {
    return this.getSpec()?.dependencies || [];
  }

  getSpec(): BundlerSpec | undefined {
    return this.definition.specs?.find((s) => s.name === this.dependency.name);
  }
}
