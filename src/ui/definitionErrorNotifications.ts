import * as vscode from 'vscode';
import { BundlerProvider } from '../bundler/bundlerProvider';
import { runBundlerInTerminal } from './terminalUtils';

import path = require('path');

export function registerDefinitionErrorNotifications(bundlerProvider: BundlerProvider): void {
  bundlerProvider.onUpdate((gemfilePath, definition) => {
    if (definition?.error === 'gemNotFound') {
      const matches = definition?.errorMessage?.match(/`bundle (install|update)( [^`]+)?`/g);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const commands = matches?.map((match) => match.match(/`bundle (.*)`/)![1]);
      const messageItems = (commands || ['install']).map(
        (command) => ({ command, title: `Run bundle ${command}` }),
      );

      vscode.window.showInformationMessage(
        definition?.errorMessage ?? 'Could not resolve all gems',
        ...messageItems,
      ).then((item) => {
        if (item) runBundlerInTerminal(item.command, path.dirname(gemfilePath.fsPath));
      });
    }
  });
}
