import * as vscode from 'vscode';
import { BundlerSpec } from '../bundler/bundlerLoader';

function transformMetadataKey(key: string): string {
  let label = key.replace(/_uri$/, '');
  label = label.replace('_', ' ');
  label = label.replace(/(^| )[a-z]/g, (c) => c.toUpperCase());

  return label;
}

function getSpecUrls(spec: BundlerSpec): Array<{ label: string; uri: vscode.Uri }> {
  const urls = [{ label: 'Homepage', uri: vscode.Uri.parse(spec.homepage) }];
  Object.entries(spec.metadata).forEach(([key, url]) => {
    if (url.match(/^https?:\/\//)) urls.push({ label: transformMetadataKey(key), uri: vscode.Uri.parse(url) });
  });
  return urls;
}

export async function chooseGemWebsite(spec: BundlerSpec): Promise<vscode.Uri | undefined> {
  const urls = getSpecUrls(spec);
  const quickPickResult = await vscode.window.showQuickPick(
    urls.map((url) => ({ label: url.label, detail: url.uri.toString(), url: url.uri })),
    { placeHolder: `Choose a website for ${spec.name}` },
  );
  return quickPickResult?.url;
}
