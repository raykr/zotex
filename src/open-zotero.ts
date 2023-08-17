import * as vscode from 'vscode';

function extractCiteKey(editor: vscode.TextEditor): string {
    if (editor.selection.isEmpty) {
        const range = editor.document.getWordRangeAtPosition(editor.selection.active);
        return editor.document.getText(range);
    } else {
        return editor.document.getText(new vscode.Range(editor.selection.start, editor.selection.end));
    }
}

export async function openInZotero() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const citeKey = extractCiteKey(editor);
    console.log(`Opening ${citeKey} in Zotero`);

    const uri = vscode.Uri.parse(`zotero://select/items/bbt:${citeKey}`);
    await vscode.env.openExternal(uri);
}