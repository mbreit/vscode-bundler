import * as vscode from 'vscode';
import { BundlerSpec } from './bundlerLoader';

function transformMetadataKey(key: string): string {
  let label = key.replace(/_uri$/, '');
  label = label.replace('_', ' ');
  label = label.replace(/(^| )[a-z]/g, (c) => c.toUpperCase());

  return label;
}

export function getSpecUrls(spec: BundlerSpec): Array<{ label: string; uri: vscode.Uri }> {
  const urls = [{ label: 'Homepage', uri: vscode.Uri.parse(spec.homepage) }];
  Object.entries(spec.metadata).forEach(([key, url]) => {
    if (url.match(/^https?:\/\//)) urls.push({ label: transformMetadataKey(key), uri: vscode.Uri.parse(url) });
  });
  return urls;
}
