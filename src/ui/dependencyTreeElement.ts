import { BundlerDefinition, BundlerDependency } from '../bundler/bundlerLoader';

export type DependencyTreeElement = [BundlerDefinition, BundlerDependency?];
