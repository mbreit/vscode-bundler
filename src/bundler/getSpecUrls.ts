import * as vscode from 'vscode';
import { BundlerSpec } from './bundlerLoader';

const URL_REGEXP = /^https?:\/\//;

function transformMetadataKey(key: string): string {
  let label = key.replace(/_uri$/, '');
  label = label.replace('_', ' ');
  label = label.replace(/(^| )[a-z]/g, (c) => c.toUpperCase());

  return label;
}

export function getSpecUrls(spec: BundlerSpec): Array<{ label: string; uri: vscode.Uri }> {
  const urls = [{ label: 'Homepage', uri: vscode.Uri.parse(spec.homepage) }];
  Object.entries(spec.metadata).forEach(([key, url]) => {
    if (key.endsWith('_uri') && url.match(URL_REGEXP)) {
      urls.push({ label: transformMetadataKey(key), uri: vscode.Uri.parse(url) });
    }
  });
  if (spec.source === 'rubygems') {
    urls.push({
      label: 'Rubygems',
      uri: vscode.Uri.parse(`https://rubygems.org/gems/${spec.name}/versions/${spec.version}`),
    });
  }
  return urls.filter((url) => url.uri.scheme === 'http' || url.uri.scheme === 'https');
}
