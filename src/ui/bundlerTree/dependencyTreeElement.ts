import { BundlerDefinition, BundlerDependency } from '../../bundler/bundlerLoader';

export class DependencyTreeElement {
  constructor(public definition: BundlerDefinition, public dependency: BundlerDependency) { }
}
