import * as vscode from 'vscode';

// global variables
let latestBibName = "";

/**
 * @param {string} name
 */
export function setLatestBibName(name: string) {
  latestBibName = name;
}
export function getLatestBibName() {
  return latestBibName ? latestBibName : defaultBibName();
}

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

