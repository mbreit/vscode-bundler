import * as vscode from 'vscode';
import { BundlerSpec } from '../bundler/bundlerLoader';
import { getSpecUrls } from '../bundler/getSpecUrls';

export async function chooseGemWebsite(spec: BundlerSpec): Promise<vscode.Uri | undefined> {
  const urls = getSpecUrls(spec);
  const quickPickResult = await vscode.window.showQuickPick(
    urls.map((url) => ({ label: url.label, detail: url.uri.toString(), url: url.uri })),
    { placeHolder: `Choose a website for ${spec.name}` },
  );
  return quickPickResult?.url;
}
