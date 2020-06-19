import * as vscode from 'vscode';
import { BundlerProvider } from '../bundler/bundlerProvider';
import { BundlerSpec } from '../bundler/bundlerLoader';
import { getSpecUrls } from '../bundler/getSpecUrls';

const GEM_REGEXP = /(gem\(?\s*['"])([^'"]+)['"]/;

class GemfileHoverProvider implements vscode.HoverProvider {
  constructor(private bundlerProvider: BundlerProvider) { }

  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.Hover> {
    const match = this.matchOnPosition(document, position);

    if (match === undefined) return undefined;

    const spec = this.getSpec(document, match.name);

    if (spec === undefined) return undefined;

    return {
      contents: this.hoverContents(spec),
      range: match.range,
    };
  }

  private hoverContents(spec: BundlerSpec): vscode.MarkedString[] {
    return [
      `**${spec.name}** ${spec.version}\n\n${spec.summary}`,
      getSpecUrls(spec).map((({ label, uri }) => `${label}: ${uri}`)).join('  \n'),
      this.markdownActions(spec),
    ];
  }

  private getSpec(document: vscode.TextDocument, name: string): BundlerSpec | undefined {
    const gemfile = this.bundlerProvider.getDefinition(document.uri);

    if (gemfile?.specs === undefined) return undefined;

    return gemfile.specs.find((s) => s.name === name);
  }

  private matchOnPosition(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): { name: string; range: vscode.Range } | undefined {
    const line = document.lineAt(position);
    const match = line.text.match(GEM_REGEXP);

    if (match?.index !== undefined) {
      const name = match[2];
      const nameStart = match.index + match[1].length;
      const nameEnd = nameStart + name.length;

      const range = new vscode.Range(line.lineNumber, nameStart, line.lineNumber, nameEnd);

      if (!range.contains(position)) return undefined;

      return { name, range };
    }

    return undefined;
  }

  private markdownCommand(label: string, command: string, args: object): string {
    return `[${label}](command:${command}?${encodeURIComponent(JSON.stringify(args))} "${label}")`;
  }

  private markdownActions(spec: BundlerSpec): vscode.MarkdownString {
    const commands = [
      this.markdownCommand('Open in new window', 'bundler.openGem', { path: spec.path }),
      this.markdownCommand('Add folder to workspace', 'bundler.addGemToWorkspace', { path: spec.path }),
    ];
    const result = new vscode.MarkdownString(commands.join(' | '));
    result.isTrusted = true;
    return result;
  }
}

export function registerGemfileHoverProvider(
  context: vscode.ExtensionContext,
  bundlerProvider: BundlerProvider,
): void {
  const hoverProvider = vscode.languages.registerHoverProvider(
    { pattern: '**/Gemfile' },
    new GemfileHoverProvider(bundlerProvider),
  );

  context.subscriptions.push(hoverProvider);
}
