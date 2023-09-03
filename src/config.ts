import * as vscode from 'vscode';
import path from 'path';

export function serverUrl() {
  return vscode.workspace.getConfiguration('zotex').get('serverUrl', 'http://localhost:23119') + '/better-bibtex';
}

export function bibliograpyStyle() {
  return vscode.workspace.getConfiguration('zotex').get('bibliograpyStyle', 'http://www.zotero.org/styles/apa');
}

export function defaultBibName(){
  return vscode.workspace.getConfiguration('zotex').get('defaultBibName', 'ref.bib');
}

export function minimizeAfterPicking() {
  return vscode.workspace.getConfiguration('zotex').get('minimizeAfterPicking', false);
}

export async function setWorkspaceBibPath(context: vscode.ExtensionContext) {
  let latestBibName = context.workspaceState.get<string>('latestBibName');

  const inputBibPath = vscode.window.showInputBox({
    value: latestBibName || defaultBibName(),
    prompt: 'File Name: support relative path, e.g. ../ref.bib and absolute path, e.g. /home/user/ref.bib',
  });
  // check if the input is valid
  return inputBibPath.then((value) => {
    if (value === undefined || value === '') {
      return latestBibName;
    }
    // check if .bib
    if (value.length < 5 || value.slice(-4) !== '.bib') {
      throw new Error('[Invalid Path]: must be a .bib file.');
    }
    // if path is relative, convert to absolute path
    if (!path.isAbsolute(value)) {
      const currentFilePath = vscode.window.activeTextEditor?.document.uri.fsPath;
      if (currentFilePath === undefined) {
        throw new Error('[Zotex Error]: please open a file first.');
      }
      value = path.join(path.dirname(currentFilePath), value);
    }

    // set 
    context.workspaceState.update('latestBibName', value);
    
    return value;
  });
}

export async function getLatestBibName(context:vscode.ExtensionContext){
  let bibName = context.workspaceState.get<string>('latestBibName');
  if(bibName === undefined){
    bibName = await setWorkspaceBibPath(context);
  }
  return bibName || "";
}