# VS Code extension for Bundler

This extension is in early development. Most of the planned features are not
implemented yet. If you encounter any bug, please report them in our [GitHub
repository](https://github.com/mbreit/vscode-bundler).

## Features

Already implemented features:

* Commands for `bundle install` and `bundle outdated`
* Commands to open a gem dependency in a new window or add the gem folder to the current workspace
* Command to open a gem's website (or its rubygems.org page)
* Hover provider for Gemfiles with gem details, homepage links and actions
* Notifications if gems are not installed with actions to run bundle install
  or bundle update
* Tree view in the Side Bar showing all Gemfiles in the workspace with
  their dependencies with icons to jump to the Gemfile and
  to open a gem in a new window:

![Tree View Demo](docs/images/dependency-tree.gif)

## Requirements

You must have Ruby and Bundler installed and in your `PATH` or set their
paths in the extension settings.

## Extension Settings

This extension contributes the following settings:

* `bundler.bundlerPath`: path to the Bundler executable, defaults to `bundle`
* `bundler.rubyPath`: path to the ruby executable, defaults to `ruby`

## Known Issues

See <https://github.com/mbreit/vscode-bundler/issues> for known issues.

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md) for release notes.

## Contributing

* <https://www.conventionalcommits.org/en/v1.0.0/>

**Enjoy!**
