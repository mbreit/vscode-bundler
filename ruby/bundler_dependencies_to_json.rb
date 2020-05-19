# frozen_string_literal: true

require 'bundler'
require 'json'

def dependency_to_json(dependency)
  {
    name: dependency.name,
    requirement: dependency.requirement.to_s
  }
end

out = {
  status: 'ok',
  path: Bundler.root
}

begin
  definition = Bundler.definition

  out[:dependencies] = definition.dependencies.map do |dependency|
    dependency_to_json(dependency)
  end

  Bundler.load

  out[:specs] = definition.specs.map do |spec|
    {
      name: spec.name,
      summary: spec.summary,
      version: spec.version,
      homepage: spec.homepage,
      path: spec.full_gem_path,
      dependencies: spec.dependencies.map do |dependency|
        dependency_to_json(dependency)
      end
    }
  end
rescue Bundler::Dsl::DSLError => e
  out.merge!(status: 'error', error: 'gemfileLoadError', message: e.message)
rescue Bundler::GemNotFound => e
  out.merge!(status: 'error', error: 'gemNotFound', errorMessage: e.message)
end

JSON.dump(out, $stdout)
